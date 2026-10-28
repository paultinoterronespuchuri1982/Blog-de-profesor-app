// src/controllers/postController.js
const mongoose = require('mongoose');
const Post = require('../models/Post');

const EDITABLE_FIELDS = ['title', 'content', 'author'];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Mantém apenas os campos permitidos e que foram enviados na requisição
const pickEditableFields = (body = {}) =>
  Object.fromEntries(
    EDITABLE_FIELDS.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
  );

// Lista todas as postagens (mais recentes primeiro)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cria uma nova postagem
exports.createPost = async (req, res) => {
  try {
    const post = await Post.create(pickEditableFields(req.body));
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lê uma postagem específica
exports.getPostById = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Postagem não encontrada' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Atualiza uma postagem (apenas os campos enviados)
exports.updatePost = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: pickEditableFields(req.body) },
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ message: 'Postagem não encontrada' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Remove uma postagem
exports.deletePost = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Postagem não encontrada' });
    res.json({ message: 'Postagem deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Busca postagens por palavra-chave
exports.searchPosts = async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) {
    return res.status(400).json({ message: 'Informe o termo de busca em ?q=' });
  }
  try {
    const posts = await Post.find({ $text: { $search: query } });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
