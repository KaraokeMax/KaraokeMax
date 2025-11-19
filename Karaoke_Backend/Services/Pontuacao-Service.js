const Pontuacao = require('../Models/Pontuacao-Model');
const Musica = require('../Models/Musica-Model');
const Artista = require('../Models/Artista-Model');
const Usuario = require('../Models/Usuario-Model');

async function adicionarPontuacao(usuarioId, nomeUsuario, musicaId, pontos, publico) {
    return await Pontuacao.create({ usuarioId, nomeUsuario, musicaId, pontos, publico });
}

async function listarPontuacoes() {
    return await Pontuacao.findAll({
        where: { publico: true },
        order: [['pontos', 'DESC']],
        include: [
            {
                model: Usuario, as: 'usuario',
                model: Musica, as : 'musica',
                include: [{ model: Artista, as: 'artista' }],
                
            }
        ]
    });
}

module.exports = {
    adicionarPontuacao,
    listarPontuacoes,
};