const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { uploadMedia } = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');

// Public routes
router.get('/posts', postController.getAllPosts);

// Protected routes (require authentication)
router.post('/posts', authenticate, uploadMedia, postController.createPost);
router.get('/users/me/posts', authenticate, postController.getPostsByUser);

// Admin routes
router.get('/posts/pending', authenticate, postController.getPendingPosts);
router.patch('/posts/:id/status', authenticate, postController.updatePostStatus);

module.exports = router; 