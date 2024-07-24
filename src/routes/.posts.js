// src/routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postcontroller');

router.get('/', postController.getAllPosts);
router.post('/', postController.createPost);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.get('/search', postController.searchPosts);


// src/routes/posts.js
const { authenticateToken } = require('../middlewares/auth');

router.post('/', authenticateToken, postController.createPost);
router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);


module.exports = router;
