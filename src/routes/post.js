const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { uploadMedia } = require('../middlewares/upload');
const { authenticate, isAdmin } = require('../middlewares/auth');

// Admin routes (require admin privileges)
router.get('/admin/all', authenticate, isAdmin, postController.getAllPosts);
router.patch('/admin/:id/status', authenticate, isAdmin, postController.updatePostStatus);

// User routes (require authentication)
router.post('/', authenticate, uploadMedia, postController.createPost);
router.get('/user/pending', authenticate, postController.getUserPendingPosts);
router.get('/user/all', authenticate, postController.getUserPosts);

module.exports = router; 