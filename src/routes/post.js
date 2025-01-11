const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticate = require('../middlewares/authenticate');

// Add these new routes
router.get('/', authenticate, postController.getPosts); // For home feed
router.get('/approved', authenticate, postController.getApprovedPosts); // For approved posts
router.get('/user/posts', authenticate, postController.getUserPosts); // For user's posts
router.post('/', authenticate, postController.createPost);

// Existing routes
router.get('/user/pending', authenticate, postController.getUserPendingPosts);
router.get('/user/approved', authenticate, postController.getUserApprovedPosts);
router.get('/user/rejected', authenticate, postController.getUserRejectedPosts);

module.exports = router; 