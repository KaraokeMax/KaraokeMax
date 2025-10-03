const express = require('express');
const router = express.Router();
const pontuacaoService = require('../Services/Pontuacao-Service');
const auth = require('../middleware/auth');

// Adicionar pontuação
router.post('/pontuacoes', auth, async (req, res) => {
    const {musicaId, pontos } = req.body;
    try {
        await pontuacaoService.adicionarPontuacao(req.usuario.id, req.usuario.nome, musicaId, pontos);
        res.status(201).json({ message: 'Pontuação adicionada com sucesso!' });
    } catch (err) {
        console.error('Erro ao adicionar pontuação:', err);
        res.status(500).json({ error: err.message || 'Erro interno no servidor' });
    }
});

// Listar todas as pontuações
router.get('/pontuacoes', auth, async (req, res) => {
    try {
        const pontuacoes = await pontuacaoService.listarPontuacoes();
        res.json(pontuacoes);
    } catch (err) {
        console.error('Erro ao listar pontuações:', err);
        res.status(500).json({ error: err.message || 'Erro interno no servidor' });
    }
});

module.exports = router;