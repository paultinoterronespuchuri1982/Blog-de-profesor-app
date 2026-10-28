// src/controllers/postcontroller.js
const mongoose = require('mongoose');
const Post = require('../models/Post');

const isNonEmptyString = (value, max) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;

const VALIDATORS = {
  title: (v) => isNonEmptyString(v, 200),
  content: (v) => isNonEmptyString(v, 10000),
  author: (v) => isNonEmptyString(v, 100),
};

// Returns the names of the fields (from `keys`) that are missing or invalid.
const invalidFields = (body, keys = Object.keys(VALIDATORS)) =>
  keys.filter((key) => !VALIDATORS[key](body[key]));

// Log the real error on the server, but never send internal details to the client.
const serverError = (res, err, where) => {
  console.error(`[${where}]`, err);
  return res.status(500).json({ message: 'Erro interno' });
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    serverError(res, err, 'getAllPosts');
  }
};

exports.createPost = async (req, res) => {
  const fields = invalidFields(req.body || {});
  if (fields.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos', fields });
  }

  try {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      owner: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    serverError(res, err, 'createPost');
  }
};

exports.getPostById = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Postagem não encontrada' });
  }
  try {
    const post = await Post.findById(req.params.id);
    if (post == null) {
      return res.status(404).json({ message: 'Postagem não encontrada' });
    }
    res.json(post);
  } catch (err) {
    serverError(res, err, 'getPostById');
  }
};

// Loads a post and checks that the token's user owns it.
// Sends the error response itself and returns null when the request must stop.
const loadOwnedPost = async (req, res) => {
  if (!isValidId(req.params.id)) {
    res.status(404).json({ message: 'Postagem não encontrada' });
    return null;
  }
  const post = await Post.findById(req.params.id);
  if (post == null) {
    res.status(404).json({ message: 'Postagem não encontrada' });
    return null;
  }
  if (post.owner !== req.user.id) {
    res.status(403).json({ message: 'Você não pode alterar esta postagem' });
    return null;
  }
  return post;
};

exports.updatePost = async (req, res) => {
  const body = req.body || {};
  const sent = Object.keys(VALIDATORS).filter((key) => body[key] !== undefined);
  if (sent.length === 0) {
    return res.status(400).json({ message: 'Nada para atualizar', fields: Object.keys(VALIDATORS) });
  }
  const fields = invalidFields(body, sent);
  if (fields.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos', fields });
  }

  try {
    const post = await loadOwnedPost(req, res);
    if (!post) return;

    sent.forEach((key) => { post[key] = body[key]; });
    const updated = await post.save();
    res.json(updated);
  } catch (err) {
    serverError(res, err, 'updatePost');
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await loadOwnedPost(req, res);
    if (!post) return;

    await Post.deleteOne({ _id: post._id });
    res.json({ message: 'Postagem deletada com sucesso' });
  } catch (err) {
    serverError(res, err, 'deletePost');
  }
};

exports.searchPosts = async (req, res) => {
  const q = req.query.q;
  if (!isNonEmptyString(q, 200)) {
    return res.status(400).json({ message: 'Informe o termo da busca em ?q=' });
  }
  try {
    const posts = await Post.find({ $text: { $search: q } });
    res.json(posts);
  } catch (err) {
    serverError(res, err, 'searchPosts');
  }
};
