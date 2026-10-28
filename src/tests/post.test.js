// src/tests/post.test.js
// Needs a MongoDB running on 127.0.0.1:27017 (CI starts one as a service).
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// The auth middleware reads this secret, so set it before loading the routes.
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-secret';
process.env.ADMIN_USERNAME = 'professor';
process.env.ADMIN_PASSWORD_HASH = require('../utils/password').hashPassword('senha-de-teste');

const token = jwt.sign({ id: 'test-user' }, process.env.ACCESS_TOKEN_SECRET, { algorithm: 'HS256' });
const auth = `Bearer ${token}`;
const otherAuth = `Bearer ${jwt.sign({ id: 'other-user' }, process.env.ACCESS_TOKEN_SECRET, { algorithm: 'HS256' })}`;

const app = express();
app.use(bodyParser.json());

beforeAll(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/test_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

app.use('/auth', require('../routes/auth'));
app.use('/posts', require('../routes/posts'));

describe('POST /auth/login', () => {
  it('devolve um token com credenciais corretas', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'professor', password: 'senha-de-teste' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('recusa a senha errada', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'professor', password: 'errada' });
    expect(response.statusCode).toBe(401);
  });
});

const samplePost = (title) => ({
  title,
  content: `This post is created for ${title}.`,
  author: 'Professor Test',
});

describe('POST /posts', () => {
  it('cria um post quando o token é válido', async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', auth)
      .send(samplePost('Test Post'));
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('title', 'Test Post');
  });

  it('recusa criar um post sem token', async () => {
    const response = await request(app).post('/posts').send(samplePost('No Token'));
    expect(response.statusCode).toBe(401);
  });
});

describe('GET /posts/:id', () => {
  let postId;

  beforeAll(async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', auth)
      .send(samplePost('Test Post for Read'));
    postId = response.body._id;
  });

  it('lê um post por ID sem token', async () => {
    const response = await request(app).get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('title', 'Test Post for Read');
  });
});

describe('Ownership', () => {
  let postId;

  beforeAll(async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', auth)
      .send(samplePost('Owned by test-user'));
    postId = response.body._id;
  });

  it('impede que outro usuário edite o post', async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set('Authorization', otherAuth)
      .send({ title: 'Hacked' });
    expect(response.statusCode).toBe(403);
  });

  it('impede que outro usuário apague o post', async () => {
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', otherAuth);
    expect(response.statusCode).toBe(403);
  });
});

describe('PUT /posts/:id', () => {
  let postId;

  beforeAll(async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', auth)
      .send(samplePost('Test Post for Update'));
    postId = response.body._id;
  });

  it('atualiza um post com token', async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set('Authorization', auth)
      .send({ ...samplePost('Updated Test Post') });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('title', 'Updated Test Post');
  });
});

describe('DELETE /posts/:id', () => {
  let postId;

  beforeAll(async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', auth)
      .send(samplePost('Test Post for Delete'));
    postId = response.body._id;
  });

  it('apaga um post com token', async () => {
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', auth);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Postagem deletada com sucesso');
  });
});
