const express = require('express');
const router = express.Router();
const artistaService = require('../Services/Artista-Service');
const auth = require('../middleware/auth');

// Criar artista
router.post('/artistas', auth, async (req, res) => {
	const { nome } = req.body;
	try {
		await artistaService.criarArtista(nome);
		res.status(201).json({ message: 'Artista criado com sucesso!' });
	} catch (err) {
		console.error('Erro ao criar artista:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Buscar todos os artistas
router.get('/artistas', auth, async (req, res) => {
	try {
		const artistas = await artistaService.buscarTodosArtistas();
		res.json(artistas);
	} catch (err) {
		console.error('Erro ao buscar artistas:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Deletar artista
router.delete('/artistas/:id', auth, async (req, res) => {
	const { id } = req.params;
	try {
		await artistaService.deletarArtista(id);
		res.json({ message: 'Artista deletado com sucesso!' });
	} catch (err) {
		console.error('Erro ao deletar artista:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

module.exports = router;
