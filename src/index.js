// src/index.js
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para analisar o corpo das requisições
app.use(bodyParser.json());

// Conexão com o banco de dados
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Banco de dados conectado'))
  .catch(err => console.error('Erro ao conectar ao banco de dados', err));

// Importa e usa as rotas
const postRoutes = require('./routes/posts');
app.use('/posts', postRoutes);

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
