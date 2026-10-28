// src/tests/post.test.js
// Needs a MongoDB running on 127.0.0.1:27017 (CI starts one as a service).
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// The auth middleware reads this secret, so set it before loading the routes.
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-secret';
const token = jwt.sign({ id: 'test-user' }, process.env.ACCESS_TOKEN_SECRET);
const auth = `Bearer ${token}`;

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

const postRoutes = require('../routes/posts');
app.use('/posts', postRoutes);

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
