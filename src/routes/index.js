const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

// Import middleware
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const { isApprover } = require('../middleware/isApprover');

// Import controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const adminController = require('../controllers/adminController');
const approverController = require('../controllers/approverController');
const subscriptionController = require('../controllers/subscriptionController');
const adController = require('../controllers/adController');
const categoryController = require('../controllers/categoryController');
const approverRoutes = require('./approverRoutes');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// User routes (all protected)
router.get('/user/profile', authenticate, userController.getProfile);
router.put('/user/profile', authenticate, upload.single('user_facial_image'), userController.updateProfile);
router.get('/user/statistics', authenticate, userController.getStatistics);
router.get('/user/searches', authenticate, userController.getRecentSearches);
router.post('/user/searches', authenticate, userController.addSearchTerm);
router.put('/user/notifications', authenticate, userController.toggleNotifications);
router.get('/user/notifications', authenticate, userController.getNotifications);

// Post routes (all protected)
router.post('/posts', authenticate, upload.single('media'), postController.createPost);
router.get('/posts/user', authenticate, postController.getUserPosts);
router.delete('/posts/:postId', authenticate, postController.deletePost);
router.post('/posts/:postId/like', authenticate, postController.likePost);

// Comment routes
router.post('/posts/:postId/comments', authenticate, commentController.addComment);
router.get('/posts/:postId/comments', authenticate, commentController.getPostComments);
router.delete('/comments/:commentId', authenticate, commentController.deleteComment);
router.post('/comments/:commentId/report', authenticate, commentController.reportComment);

// Category routes
router.get('/categories', categoryController.getAllCategories);

// Admin routes
router.post('/admin/approvers', authenticate, isAdmin, adminController.registerApprover);
router.post('/admin/accounts/manage', authenticate, isAdmin, adminController.manageAccount);
router.post('/admin/ads', authenticate, isAdmin, upload.single('ad_video'), adminController.uploadAd);

// Approver routes
router.use('/approver', approverRoutes);

// Subscription routes
router.post('/subscriptions/:username', authenticate, subscriptionController.subscribe);
router.delete('/subscriptions/:username', authenticate, subscriptionController.unsubscribe);
router.get('/subscriptions/subscribers', authenticate, subscriptionController.getSubscribers);

// Ad routes
router.get('/ads', authenticate, adController.getActiveAds);
router.delete('/ads/:adId', authenticate, isAdmin, adController.deleteAd);

module.exports = router; 