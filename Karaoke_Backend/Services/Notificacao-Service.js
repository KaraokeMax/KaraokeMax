const Notificacao = require('../Models/Notificacao-Model');

async function criarNotificacao(usuarioId, musicaId, mensagem, sucesso, detalhes = null) {
    await Notificacao.create({ usuarioId, musicaId, mensagem, sucesso, detalhes });
}

module.exports = {
    criarNotificacao,
};
