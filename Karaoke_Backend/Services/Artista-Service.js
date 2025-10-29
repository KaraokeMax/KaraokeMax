const Artista = require('../Models/Artista-Model');
const { toSlug } = require('../Helpers/Slug-Helper');

async function criarArtista(nome) {
	const slug = toSlug(nome);
	const artistaExistente = await Artista.findOne({ where: { slug } });
	if (artistaExistente) {
		return artistaExistente;
	}
	return await Artista.create({ nome, slug });
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
