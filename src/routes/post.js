const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { uploadMedia } = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');

// Admin routes
router.get('/all', authenticate, postController.getAllPosts);
router.patch('/:id/status', authenticate, postController.updatePostStatus);

// User routes
router.post('/', authenticate, uploadMedia, postController.createPost);
router.get('/', authenticate, postController.getAllPosts);
router.get('/user', authenticate, postController.getPostsByUser);

module.exports = router; 