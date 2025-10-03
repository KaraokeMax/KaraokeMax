const Pontuacao = require('../Models/Pontuacao-Model');

async function adicionarPontuacao(usuarioId, nomeUsuario, musicaId, pontos) {
    return await Pontuacao.create({ usuarioId, nomeUsuario, musicaId, pontos });
}

async function listarPontuacoes() {
    return await Pontuacao.findAll();
}

module.exports = {
    adicionarPontuacao,
    listarPontuacoes,
};