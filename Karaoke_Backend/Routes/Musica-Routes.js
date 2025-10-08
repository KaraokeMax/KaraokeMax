const express = require('express');
const router = express.Router();
const musicaService = require('../Services/Musica-Service');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const notificacaoService = require('../Services/Notificacao-Service');

// Criar música
router.post('/musicas', auth, upload.fields([{ name: 'audio' }, { name: 'lrc' }]), (req, res) => {
	if (!req.usuario) return res.status(401).json({ error: 'Usuário não autenticado.' });

	const { nome, artistaId } = req.body;
	const audioFile = req.files['audio']?.[0];
	const lrcFile = req.files['lrc']?.[0];
	if (!nome || !artistaId || !audioFile || !lrcFile) {
		return res.status(400).json({ error: 'Estão faltando informações.' });
	}

	res.status(202).json({ message: 'Processamento da música iniciado.' });

	setImmediate(async () => {
		try {
			await musicaService.criarMusica(nome, artistaId, audioFile, lrcFile);
		} catch (err) {
			console.error('Erro ao criar/processar música (assíncrono):', err);
			await musicaService.alteraStatusMusica(musica.id, StatusMusica.ERRO);
			await notificacaoService.criarNotificacao(req.usuario.id, null, `Erro ao criar/processar a música "${nome}".`, false, err.message);
		}
	});
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
