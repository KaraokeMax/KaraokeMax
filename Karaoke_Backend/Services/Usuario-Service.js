const Usuario = require('../Models/Usuario-Model');

async function criarUsuario(nome, email, tipo) {
	return await Usuario.create({ nome, email, tipo });
}

async function alterarSenhaPrimeiroAcesso(id, novaSenha) {
	return await Usuario.update(
		{ senha: novaSenha, primeiroAcesso: false },
		{ where: { id } }
	);
}

async function verificaLogin(email, senha) {
	const usuario = await Usuario.findOne({ where: { email, senha } });
	if (usuario) {
		return usuario;
	}
	throw new Error('Usuário não encontrado');
}

async function criaSenha(idUsuario, novaSenha) {
	return await Usuario.update(
		{ senha: novaSenha, primeiroAcesso: false },
		{ where: { id: idUsuario } }
	);
}

async function deletarUsuario(id) {
	return await Usuario.destroy({ where: { id } });
}

async function buscarTodosUsuarios() {
	return await Usuario.findAll();
}

async function buscarPorId(id) {
	const usuario = await Usuario.findByPk(id, {
		include: [{
			association: 'notificacoes',
			where: { lida: false },
			required: false
		}]
	});
	if (usuario) {
		return usuario;
	}
	throw new Error('Usuário não encontrado');
}

async function atualizarTokenUsuario(id, token) {
	return await Usuario.update(
		{ token },
		{ where: { id } }
	);
}

module.exports = {
	criarUsuario,
	alterarSenhaPrimeiroAcesso,
	verificaLogin,
	criaSenha,
	deletarUsuario,
	buscarTodosUsuarios,
	buscarPorId,
	atualizarTokenUsuario,
};
