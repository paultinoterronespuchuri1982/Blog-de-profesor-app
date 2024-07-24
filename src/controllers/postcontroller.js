// src/controllers/postController.js
const Post = require('../models/Post');

// Lista todas as postagens
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cria uma nova postagem
exports.createPost = async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lê uma postagem específica
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post == null) {
      return res.status(404).json({ message: 'Postagem não encontrada' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Atualiza uma postagem
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post == null) {
      return res.status(404).json({ message: 'Postagem não encontrada' });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.author = req.body.author || post.author;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deleta uma postagem
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post == null) {
      return res.status(404).json({ message: 'Postagem não encontrada' });
    }

    await post.remove();
    res.json({ message: 'Postagem deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Busca postagens por palavra-chave
exports.searchPosts = async (req, res) => {
  try {
    const query = req.query.q;
    const posts = await Post.find({ $text: { $search: query } });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
