const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const postController = require('../controllers/postController');

// Get user's posts
router.get('/user', authenticate, postController.getUserPosts);
router.post('/', authenticate, postController.createPost);
router.get('/:id', authenticate, postController.getPost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

module.exports = router; 