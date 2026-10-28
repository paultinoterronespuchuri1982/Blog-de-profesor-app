// src/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 10000 },
    author: { type: String, required: true, trim: true, maxlength: 100 },
    // Id of the user who created the post (the "sub" of the token). Only this user can edit or delete it.
    owner: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Needed by GET /posts/search, which uses $text.
PostSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', PostSchema);
