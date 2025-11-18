const Musica = require('../Models/Musica-Model');
const artistaService = require('../Services/Artista-Service');
const StatusMusica = require('../Helpers/Musica-Helper');
const { Op } = require('sequelize');
const axios = require('axios');
const urlPythonServer = process.env.PYTHON_SERVER_URL;
const notificacaoService = require('./Notificacao-Service');
const { toSlug } = require('../Helpers/Slug-Helper');
const { criarArquivoLRC } = require('../Helpers/Lrc-Helpers');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

async function criarMusica(nome, nomeArtista, audioFile, lrc, idUser) {
	console.log(`Iniciando criação da música "${nome}" do artista "${nomeArtista}"...`);
	const artista = await artistaService.criarArtista(nomeArtista);
	if (!artista) throw new Error('Erro ao criar artista.');

	const slug = toSlug(nome);
	let musica = await Musica.create({ nome, artistaId: artista.id, slug, usuarioCriadorId: idUser });
	let mp3Path = null;
		
	try {

		let lrcFile = criarArquivoLRC(lrc);
		mp3Path = path.resolve(audioFile.path);

		const formData = new FormData();
		formData.append("audio", fs.createReadStream(mp3Path), {filename: audioFile.originalname, contentType: audioFile.mimetype});
		formData.append("lrc", lrcFile.conteudo, {filename: lrcFile.nome, contentType: lrcFile.tipo});
		formData.append("musica", musica.slug);
		formData.append("artista", artista.slug);
		formData.append("id_musica", musica.id);

		console.log(`Enviando música "${musica.nome}" para processamento no servidor Python...`);
		const pythonResponse = await axios.post(`${urlPythonServer}/process`, formData, {
			headers: formData.getHeaders(),  
			maxBodyLength: Infinity
		});

		if (pythonResponse.status !== 202) {
			throw new Error(`Erro no processamento da música. Status: ${pythonResponse.status}`);
		}
		console.log("Música enviada para processamento com sucesso.");		
	}
	catch (err) {
		console.error('Erro ao criar/processar música:', err);
		notificacaoService.criarNotificacao(idUser, musica.id, `Erro ao criar/processar a música "${nome}".`, false, err.message);
		throw err;
	}
	finally {
		// Limpeza de arquivos temporários
		fs.unlinkSync(mp3Path);	
	}	
}

async function buscarTodasMusicas() {
	return await Musica.findAll({
		include: [{
			model: Artista,
			as: 'artista'
		}]
	});
}

async function deletarMusica(id) {
	return await Musica.destroy({ where: { id } });
}

async function alteraStatusMusica(id, status, erro = null) {
	if (!Object.values(StatusMusica).includes(status)) {
		throw new Error('Status inválido');
	}

	let musica = await Musica.update({ status: status }, { where: { id: id } }, { returning: true });

	if (status === StatusMusica.ERRO) {
		await notificacaoService.criarNotificacao(musica.usuarioCriadorId, musica.id, `Houve um erro ao processar a música "${musica.nome}". Erro: ${erro}`, false);
	}
	else {
		await notificacaoService.criarNotificacao(musica.usuarioCriadorId, musica.id, `Processamento da música "${musica.nome}" finalizado com sucesso.`, true);
	}
}

async function buscarMusicaComArtista(id) {
	const musica = await Musica.findByPk(id, {
		include: [{
			model: Artista,
			as: 'artista',
		}]
	});

	if (!musica) throw new Error('Música não encontrada');

	return {
		musica_slug: musica.slug,
		artista_slug: musica.artista.slug
	};
}
	
async function verificarMusicaExiste(nomeMusica) {
	const musica_slug = toSlug(nomeMusica);
	const musica = await Musica.findOne({ where: { slug: musica_slug, status: { [Op.ne]: StatusMusica.ERRO } } });
	return !!musica;
}

module.exports = {
	criarMusica,
	buscarTodasMusicas,
	deletarMusica,
	verificarMusicaExiste,
	buscarMusicaComArtista,
	alteraStatusMusica
};

