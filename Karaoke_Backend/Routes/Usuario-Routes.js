const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const usuarioService = require('../Services/Usuario-Service');
const auth = require('../middleware/auth');

// Criar usuário
router.post('/usuarios', auth, async (req, res) => {
	const { nome, email, tipo } = req.body;
	try {
		await usuarioService.criarUsuario(nome, email, tipo);
		res.status(201).json({ message: 'Usuário criado com sucesso!' });
	} catch (err) {
		console.error('Erro ao criar usuário:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Alterar senha no primeiro acesso
router.put('/usuarios/:id/senha', auth, async (req, res) => {
	const { id } = req.params;
	const { novaSenha } = req.body;
	try {
		await usuarioService.alterarSenhaPrimeiroAcesso(id, novaSenha);
		res.json({ message: 'Senha alterada com sucesso!' });
	} catch (err) {
		console.error('Erro ao alterar senha:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Verificar login
router.post('/usuarios/login', async (req, res) => {
	const { email, senha } = req.body;
	try {
		const usuario = await usuarioService.verificaLogin(email, senha);
		if (usuario) {
			// Gerar token JWT
			const token = jwt.sign(
				{ id: usuario.id, email: usuario.email, nome: usuario.nome},
				process.env.JWT_SECRET,
				{ expiresIn: '1h' }
			);
			await usuarioService.atualizarTokenUsuario(usuario.id, token);
			const resposta = { token };
			if (usuario.primeiroAcesso) {
				resposta.primeiroAcesso = true;
			}
			res.json(resposta);
		} else {
			res.status(401).json({ error: 'Login inválido' });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Rota para buscar usuário pelo token
router.get('/usuarios/me', auth, async (req, res) => {
	try {
		const usuarioId = req.usuario.id;
		const usuario = await usuarioService.buscarPorId(usuarioId);
		if (usuario) {
			res.json(usuario);
		} else {
			res.status(404).json({ error: 'Usuário não encontrado' });
		}
	} catch (err) {
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Criar senha (igual ao alterar senha)
router.put('/usuarios/:id/criasenha', auth, async (req, res) => {
	const { id } = req.params;
	const { novaSenha } = req.body;
	try {
		await usuarioService.criaSenha(id, novaSenha);
		res.json({ message: 'Senha criada com sucesso!' });
	} catch (err) {
		console.error('Erro ao criar senha:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Deletar usuário
router.delete('/usuarios/:id', auth, async (req, res) => {
	const { id } = req.params;
	try {
		await usuarioService.deletarUsuario(id);
		res.json({ message: 'Usuário deletado com sucesso!' });
	} catch (err) {
		console.error('Erro ao deletar usuário:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

// Buscar todos os usuários
router.get('/usuarios', async (req, res) => {
	try {
		const usuarios = await usuarioService.buscarTodosUsuarios();
		res.json(usuarios);
	} catch (err) {
		console.error('Erro ao buscar usuários:', err);
		res.status(500).json({ error: err.message || 'Erro interno no servidor' });
	}
});

module.exports = router;
