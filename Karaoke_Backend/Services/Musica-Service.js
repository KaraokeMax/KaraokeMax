const Musica = require('../Models/Musica-Model');
const Artista = require('../Models/Artista-Model');
const StatusMusica = require('../Helpers/Musica-Helper');
const { Op } = require('sequelize');
const axios = require('axios');
const urlPythonServer = process.env.PYTHON_SERVER_URL;
const notificacaoService = require('./Notificacao-Service');

async function criarMusica(nome, artistaId, audioFile, lrcFile) {
	let artista = await Artista.findByPk(artistaId);		
	if (!artista) throw new Error('Artista não encontrado');

	const slug = toSlug(nome);
	let musica = await Musica.create({ nome, artistaId, slug });

    const pythonResponse = await axios.post(`${urlPythonServer}/process`, {
        musica_nome: musica.slug,
        artista_nome: artista.slug,
        audio: audioFile,
        lrc: lrcFile
	});

	if (pythonResponse.status !== 200) {
		await notificacaoService.criarNotificacao(musica.idUsuarioCriador, musica.id, `Erro ao processar a música "${musica.nome}".`, false, pythonResponse.data);
		return
	}

	musica = await alteraStatusMusica(musica.id, StatusMusica.PRONTA);
	await notificacaoService.criarNotificacao(musica.idUsuarioCriador, musica.id, `Música "${musica.nome}" processada com sucesso!`, true);
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

async function alteraStatusMusica(id, status) {
	if (!Object.values(StatusMusica).includes(status)) {
		throw new Error('Status inválido');
	}

	const musica = await Musica.updateOne({ _id: id }, { status: status });
	return musica;
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
	
async function verificarMusicaExiste(musica_slug) {
	// Busca uma música pelo slug cujo status seja diferente de ERRO
	const musica = await Musica.findOne({ where: { slug: musica_slug, status: { [Op.ne]: StatusMusica.ERRO } } });
	return !!musica;
}

module.exports = {
	criarMusica,
	buscarTodasMusicas,
	deletarMusica,
	verificarMusicaExiste,
	buscarMusicaComArtista
};

