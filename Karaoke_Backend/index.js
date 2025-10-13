const express = require('express');
require('dotenv').config();
require('./Models/associations');
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 3000;

const usuarioRoutes = require('./Routes/Usuario-Routes');
const artistaRoutes = require('./Routes/Artista-Routes');
const musicaRoutes = require('./Routes/Musica-Routes');
const pontuacaoRoutes = require('./Routes/Pontuacao-Routes');
const sequelize = require('./sequelize');

// ✅ Habilita CORS antes de qualquer rota
app.use(cors({
  origin: [
    'http://localhost:5173', // seu front local (Vite)
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
  credentials: true
}));

// Middleware para JSON
app.use(express.json());

app.use(usuarioRoutes);
app.use(artistaRoutes);
app.use(musicaRoutes);
app.use(pontuacaoRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Banco de dados sincronizado.');
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao sincronizar o banco de dados:', err);
  });
