const Artista = require('../Models/Artista-Model');

async function criarArtista(nome) {
	return await Artista.create({ nome });
}

async function buscarTodosArtistas() {
	return await Artista.findAll();
}

async function deletarArtista(id) {
	return await Artista.destroy({ where: { id } });
}

module.exports = {
	criarArtista,
	buscarTodosArtistas,
	deletarArtista,
};
