// src/app.js
// Configura a aplicação Express sem iniciar o servidor (facilita os testes).
const express = require('express');
const postRoutes = require('./routes/posts');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/posts', postRoutes);

app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada' }));

module.exports = app;
