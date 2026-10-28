// src/index.js
// Ponto de entrada: conecta ao MongoDB e inicia o servidor HTTP.
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Defina MONGO_URI no arquivo .env (veja .env.example)');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Banco de dados conectado');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados', err.message);
    process.exit(1);
  });
