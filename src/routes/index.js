const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Import controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const categoryController = require('../controllers/categoryController');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// User routes (all protected)
router.get('/user/profile', authenticate, userController.getProfile);
router.put('/user/profile', authenticate, userController.updateProfile);
router.get('/user/statistics', authenticate, userController.getStatistics);
router.get('/user/searches', authenticate, userController.getRecentSearches);
router.post('/user/searches', authenticate, userController.addSearchTerm);
router.put('/user/notifications', authenticate, userController.toggleNotifications);
router.get('/user/notifications', authenticate, userController.getNotifications);

// Post routes (all protected)
router.post('/posts', authenticate, postController.createPost);
router.get('/posts/user', authenticate, postController.getUserPosts);
router.delete('/posts/:postId', authenticate, postController.deletePost);
router.post('/posts/:postId/like', authenticate, postController.likePost);
router.post('/posts/:postId/comments', authenticate, postController.addComment);
router.get('/posts/:postId/comments', authenticate, postController.getPostComments);

// Category routes
router.get('/categories', categoryController.getAllCategories);

module.exports = router; 