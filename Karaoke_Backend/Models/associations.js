const Artista = require('./Artista-Model');
const Musica = require('./Musica-Model');
const Pontuacao = require('./Pontuacao-Model');
const Usuario = require('./Usuario-Model');
const Notificacao = require('./Notificacao-Model');

// Artista <-> Musica
Artista.hasMany(Musica, { foreignKey: 'artistaId', as: 'musicas' });
Musica.belongsTo(Artista, { foreignKey: 'artistaId', as: 'artista' });

// Musica <-> Pontuacao
Musica.hasMany(Pontuacao, { foreignKey: 'musicaId', as: 'pontuacoes' });
Pontuacao.belongsTo(Musica, { foreignKey: 'musicaId', as: 'musica' });

// Usuario <-> Pontuacao
Usuario.hasMany(Pontuacao, { foreignKey: 'usuarioId', as: 'pontuacoes' });
Pontuacao.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Musica <-> Usuario (criador)
Musica.belongsTo(Usuario, { foreignKey: 'usuarioCriadorId', as: 'criador' });
Usuario.hasMany(Musica, { foreignKey: 'usuarioCriadorId', as: 'musicasCriadas' });

// Usuario <-> Notificacao
Usuario.hasMany(Notificacao, { foreignKey: 'usuarioId', as: 'notificacoes' });
Notificacao.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

module.exports = {
  Artista,
  Musica,
  Pontuacao,
  Usuario,
  Notificacao
};
