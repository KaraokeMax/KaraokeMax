const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const usuarioRoutes = require('./Routes/Usuario-Routes');
const artistaRoutes = require('./Routes/Artista-Routes');
const musicaRoutes = require('./Routes/Musica-Routes');
const pontuacaoRoutes = require('./Routes/Pontuacao-Routes');

// Middleware para JSON
app.use(express.json());


app.use(usuarioRoutes);
app.use(artistaRoutes);
app.use(musicaRoutes);
app.use(pontuacaoRoutes);


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
