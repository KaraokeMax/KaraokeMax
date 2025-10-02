const express = require('express');
const router = express.Router();
const musicaService = require('../Services/Musica-Service');
const auth = require('../middleware/auth');

// Criar música
router.post('/musicas', auth, async (req, res) => {
	const { nome, artistaId } = req.body;
	try {
		await musicaService.criarMusica(nome, artistaId);
		res.status(201).json({ message: 'Música criada com sucesso!' });
	} catch (err) {
		console.error('Erro ao criar música:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Buscar todas as músicas
router.get('/musicas', auth, async (req, res) => {
	try {
		const musicas = await musicaService.buscarTodasMusicas();
		res.json(musicas);
	} catch (err) {
		console.error('Erro ao buscar músicas:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Deletar música
router.delete('/musicas/:id', auth, async (req, res) => {
	const { id } = req.params;
	try {
		await musicaService.deletarMusica(id);
		res.json({ message: 'Música deletada com sucesso!' });
	} catch (err) {
		console.error('Erro ao deletar música:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

module.exports = router;
