// server.js (ou app.js)
const express = require('express');
require('dotenv').config();

// carrega associações antes do sync
require('./Models/associations');

const cors = require('cors');
const sequelize = require('./sequelize');

// rotas
const usuarioRoutes   = require('./Routes/Usuario-Routes');
const artistaRoutes   = require('./Routes/Artista-Routes');
const musicaRoutes    = require('./Routes/Musica-Routes');
const pontuacaoRoutes = require('./Routes/Pontuacao-Routes');
const notificacaoRoutes = require('./Routes/Notificacoes-Route');

const app  = express();
const port = process.env.PORT || 3000;

/* ---------- CORS ---------- */
const allowedOrigins = [
  'http://localhost:5173',
  // adicione outras origens se precisar, ou use process.env.CORS_ORIGIN
];

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);                // permite curl/Postman
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS não permitido para esta origem: ' + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

//cria pasta uploads se nao existir
const fs = require('fs');
const uploadDir = 'uploads/';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ---------- Middlewares ---------- */
app.use(express.json());

/* ---------- Rotas ---------- */
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use(usuarioRoutes);
app.use(artistaRoutes);
app.use(musicaRoutes);
app.use(pontuacaoRoutes);
app.use(notificacaoRoutes);

/* ---------- Boot ---------- */
(async () => {
  try {
    // 1) Testa credenciais/alcance do DB
    await sequelize.authenticate();
    console.log('Conexão com o banco OK.');

    // 2) Sincroniza SEM alter/force (não altera schema existente)
    await sequelize.sync({alter: false});
    console.log('Banco de dados sincronizado');

    // 3) Sobe servidor
    const server = app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });

    // 4) Encerramento gracioso
    const shutdown = async (signal) => {
      try {
        console.log(`\n${signal} recebido. Encerrando...`);
        server.close(() => console.log('HTTP fechado.'));
        await sequelize.close();
        console.log('Conexões ao DB fechadas.');
        process.exit(0);
      } catch (e) {
        console.error('Erro ao encerrar:', e);
        process.exit(1);
      }
    };
    process.on('SIGINT',  () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Falha ao iniciar:', err);
    process.exit(1);
  }
})();
