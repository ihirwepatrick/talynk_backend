const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticate = require('../middlewares/authenticate');
const isAdmin = require('../middlewares/isAdmin');

// Add these new routes for admin post management
router.get('/pending', authenticate, isAdmin, postController.getPendingPosts);
router.get('/approved', authenticate, isAdmin, postController.getApprovedPosts);
router.get('/rejected', authenticate, isAdmin, postController.getRejectedPosts);

// Existing routes
router.post('/', authenticate, postController.createPost);
router.get('/', authenticate, postController.getPosts);
router.patch('/:id/approve', authenticate, isAdmin, postController.approvePost);
router.patch('/:id/reject', authenticate, isAdmin, postController.rejectPost);

module.exports = router; 