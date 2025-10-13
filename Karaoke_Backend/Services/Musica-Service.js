const Musica = require('../Models/Musica-Model');
const Artista = require('../Models/Artista-Model');
const StatusMusica = require('../Helpers/Musica-Helper');
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
			as: 'artista',
			attributes: ['nome']
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

module.exports = {
	criarMusica,
	buscarTodasMusicas,
	deletarMusica
};
