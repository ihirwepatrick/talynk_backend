const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middlewares/auth');
const { uploadMedia } = require('../middlewares/upload');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPost);

// Protected routes
router.use(authenticate);
router.post('/', uploadMedia, postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.patch('/:id/status', postController.updatePostStatus);

module.exports = router; 