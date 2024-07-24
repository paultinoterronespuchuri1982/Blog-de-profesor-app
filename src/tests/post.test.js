// src/tests/post.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// Configuração do middleware e rotas para testes
app.use(bodyParser.json());

// Configuração da conexão com o banco de dados em memória
beforeAll(async () => {
  const url = 'mongodb://127.0.0.1:27017/test_db'; // Banco de dados em memória para testes
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

// Importa e usa as rotas do post
const postRoutes = require('../routes/posts');
app.use('/posts', postRoutes);

// Teste de criação de post
describe('POST /posts', () => {
  it('deve criar um novo post', async () => {
    const response = await request(app)
      .post('/posts')
      .send({
        title: 'Test Post',
        content: 'This is a test post.',
        author: 'Professor Test'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('title', 'Test Post');
  });
});

// Teste de leitura de post por ID
describe('GET /posts/:id', () => {
  let postId;

  beforeAll(async () => {
    // Cria um post para os testes de leitura
    const response = await request(app)
      .post('/posts')
      .send({
        title: 'Test Post for Read',
        content: 'This post is created for read test.',
        author: 'Professor Read Test'
      });
    postId = response.body._id;
  });

  it('deve ler um post por ID', async () => {
    const response = await request(app)
      .get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('title', 'Test Post for Read');
  });
});

// Teste de atualização de post
describe('PUT /posts/:id', () => {
  let postId;

  beforeAll(async () => {
    // Cria um post para os testes de atualização
    const response = await request(app)
      .post('/posts')
      .send({
        title: 'Test Post for Update',
        content: 'This post is created for update test.',
        author: 'Professor Update Test'
      });
    postId = response.body._id;
  });

  it('deve atualizar um post', async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .send({
        title: 'Updated Test Post',
        content: 'This post has been updated.',
        author: 'Professor Update Test'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('title', 'Updated Test Post');
  });
});

// Teste de exclusão de post
describe('DELETE /posts/:id', () => {
  let postId;

  beforeAll(async () => {
    // Cria um post para os testes de exclusão
    const response = await request(app)
      .post('/posts')
      .send({
        title: 'Test Post for Delete',
        content: 'This post is created for delete test.',
        author: 'Professor Delete Test'
      });
    postId = response.body._id;
  });

  it('deve deletar um post', async () => {
    const response = await request(app)
      .delete(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Postagem deletada com sucesso');
  });
});
