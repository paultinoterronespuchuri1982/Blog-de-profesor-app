// src/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    author: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Índice de texto para a busca por palavra-chave (GET /posts/search?q=...)
postSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', postSchema);
