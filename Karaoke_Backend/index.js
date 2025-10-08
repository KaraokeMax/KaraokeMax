const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const usuarioRoutes = require('./Routes/Usuario-Routes');
const artistaRoutes = require('./Routes/Artista-Routes');
const musicaRoutes = require('./Routes/Musica-Routes');
const pontuacaoRoutes = require('./Routes/Pontuacao-Routes');
const sequelize = require('./sequelize');

// Middleware para JSON
app.use(express.json());


// Rota para servir o HTML tester
app.get('/teste-musicas', (req, res) => {
  res.sendFile(__dirname + '/test-musicas.html');
});

app.use(usuarioRoutes);
app.use(artistaRoutes);
app.use(musicaRoutes);
app.use(pontuacaoRoutes);


sequelize.sync()
  .then(() => {
    console.log('Banco de dados sincronizado com os models.');
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao sincronizar o banco de dados:', err);
  });
