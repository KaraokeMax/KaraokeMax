const Musica = require('../Models/Musica-Model');

async function criarMusica(nome, artistaId) {
	return await Musica.create({ nome, artistaId });
}

async function buscarTodasMusicas() {
	return await Musica.findAll();
}

async function deletarMusica(id) {
	return await Musica.destroy({ where: { id } });
}

module.exports = {
	criarMusica,
	buscarTodasMusicas,
	deletarMusica,
};
