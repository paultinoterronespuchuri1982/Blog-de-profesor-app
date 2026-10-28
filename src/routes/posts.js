// src/routes/posts.js
const express = require('express');
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Leitura pública
router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts); // antes de /:id para não ser capturado por ele
router.get('/:id', postController.getPostById);

// Escrita exige token JWT
router.post('/', authenticateToken, postController.createPost);
router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);

module.exports = router;
