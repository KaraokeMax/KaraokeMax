const Notificacao = require('../Models/Notificacao-Model');

async function criarNotificacao(usuarioId, musicaId, mensagem, sucesso, detalhes = null) {
    await Notificacao.create({ usuarioId, musicaId, mensagem, sucesso, detalhes });
}

async function marcarComoLida(id) {
    await Notificacao.update({ lida: true }, { where: { id } });
}

module.exports = {
    criarNotificacao,
    marcarComoLida
};
