// src/routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postcontroller');
const { authenticateToken } = require('../middlewares/auth');

// Public reads. /search must come before /:id, or "search" is read as an id.
router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts);
router.get('/:id', postController.getPostById);

// Writes require a valid token.
router.post('/', authenticateToken, postController.createPost);
router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);

module.exports = router;
