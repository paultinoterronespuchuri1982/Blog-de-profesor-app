// src/tests/posts.test.js
// Requer um MongoDB acessível em MONGO_URI_TEST (no CI, um serviço "mongo" é iniciado).
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'segredo-de-teste';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const Post = require('../models/Post');

const TEST_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/blog_test';
const token = jwt.sign({ user: 'professor-teste' }, process.env.ACCESS_TOKEN_SECRET);
const authHeader = { Authorization: `Bearer ${token}` };

const samplePost = (overrides = {}) => ({
  title: 'Aula de matemática',
  content: 'Frações equivalentes e simplificação.',
  author: 'Professor Teste',
  ...overrides,
});

beforeAll(async () => {
  await mongoose.connect(TEST_URI);
  await mongoose.connection.db.dropDatabase();
  await Post.syncIndexes(); // recria o índice de texto usado pela busca
});

beforeEach(async () => {
  await Post.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /posts', () => {
  it('exige token de autenticação', async () => {
    const res = await request(app).post('/posts').send(samplePost());
    expect(res.statusCode).toBe(401);
  });

  it('cria uma postagem com token válido', async () => {
    const res = await request(app).post('/posts').set(authHeader).send(samplePost());
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('title', 'Aula de matemática');
    expect(res.body).toHaveProperty('_id');
  });

  it('rejeita postagem sem título', async () => {
    const res = await request(app)
      .post('/posts')
      .set(authHeader)
      .send(samplePost({ title: undefined }));
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /posts e GET /posts/:id', () => {
  it('lista as postagens', async () => {
    await Post.create([samplePost({ title: 'A' }), samplePost({ title: 'B' })]);
    const res = await request(app).get('/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('retorna 400 para um ID inválido', async () => {
    const res = await request(app).get('/posts/nao-e-um-id');
    expect(res.statusCode).toBe(400);
  });

  it('retorna 404 para um ID inexistente', async () => {
    const res = await request(app).get(`/posts/${new mongoose.Types.ObjectId()}`);
    expect(res.statusCode).toBe(404);
  });

  it('lê uma postagem pelo ID', async () => {
    const post = await Post.create(samplePost());
    const res = await request(app).get(`/posts/${post._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', post.title);
  });
});

describe('PUT /posts/:id', () => {
  it('atualiza apenas os campos enviados', async () => {
    const post = await Post.create(samplePost());
    const res = await request(app)
      .put(`/posts/${post._id}`)
      .set(authHeader)
      .send({ title: 'Título atualizado' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', 'Título atualizado');
    expect(res.body).toHaveProperty('author', post.author);
  });

  it('exige token de autenticação', async () => {
    const post = await Post.create(samplePost());
    const res = await request(app).put(`/posts/${post._id}`).send({ title: 'X' });
    expect(res.statusCode).toBe(401);
  });
});

describe('DELETE /posts/:id', () => {
  it('remove a postagem', async () => {
    const post = await Post.create(samplePost());
    const res = await request(app).delete(`/posts/${post._id}`).set(authHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Postagem deletada com sucesso');

    const after = await request(app).get(`/posts/${post._id}`);
    expect(after.statusCode).toBe(404);
  });
});

describe('GET /posts/search', () => {
  it('encontra postagens pela palavra-chave', async () => {
    await Post.create(samplePost({ title: 'Geometria espacial' }));
    await Post.create(samplePost({ title: 'História do Brasil', content: 'Colonização.' }));

    const res = await request(app).get('/posts/search').query({ q: 'geometria' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Geometria espacial');
  });

  it('exige o parâmetro q', async () => {
    const res = await request(app).get('/posts/search');
    expect(res.statusCode).toBe(400);
  });
});
