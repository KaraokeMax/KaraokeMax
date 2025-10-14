const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const notificacaoService = require('../Services/Notificacao-Service');

router.patch("/notificacoes/:id/lida", async (req, res) => {
    const { id } = req.params;
    try {
        await notificacaoService.marcarComoLida(id);
        res.sendStatus(204);
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
    }
});
