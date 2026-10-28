// src/index.js
require('dotenv').config(); // Loads variables from src/.env or the project .env
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.ACCESS_TOKEN_SECRET) {
  console.error('ACCESS_TOKEN_SECRET não está definido. Veja .env.example.');
  process.exit(1);
}

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Errors from the body parser are client errors; anything else is ours.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Corpo da requisição muito grande' });
  }
  console.error(err);
  res.status(500).json({ message: 'Erro interno' });
});

// Start listening only after the database is reachable.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Banco de dados conectado');
    app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados', err.message);
    process.exit(1);
  });
