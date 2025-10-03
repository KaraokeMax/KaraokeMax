const Pontuacao = require('../Models/Pontuacao-Model');

async function adicionarPontuacao(usuarioId, nomeUsuario, idMusica, pontos, publico) {
    return await Pontuacao.create({ usuarioId, nomeUsuario, idMusica, pontos, publico });
}

async function listarPontuacoes() {
    return await Pontuacao.findAll();
}

module.exports = {
    adicionarPontuacao,
    listarPontuacoes,
};