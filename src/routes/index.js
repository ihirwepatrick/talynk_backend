const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const { isApprover } = require('../middleware/isApprover');
const upload = require('../middleware/fileUpload');

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

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/refresh-token', authController.refreshToken);

// User routes (all protected)
router.get('/user/profile', authenticate, userController.getProfile);
router.put('/user/profile', authenticate, ...upload.single('user_facial_image'), userController.updateProfile);
router.get('/user/statistics', authenticate, userController.getStatistics);
router.get('/user/searches', authenticate, userController.getRecentSearches);
router.post('/user/searches', authenticate, userController.addSearchTerm);
router.put('/user/notifications', authenticate, userController.toggleNotifications);
router.get('/user/notifications', authenticate, userController.getNotifications);
router.put('/user/notifications/read-all', authenticate, userController.markAllNotificationsAsRead);

// Post routes (all protected)
router.post('/posts', authenticate, ...upload.single('file'), postController.createPost);
router.get('/posts/user', authenticate, postController.getUserPosts);
router.get('/posts/liked', authenticate, postController.getLikedPosts);
router.delete('/posts/:postId', authenticate, postController.deletePost);
router.post('/posts/:postId/like', authenticate, postController.likePost);
router.get('/posts/:postId/like-status', authenticate, postController.checkLikeStatus);
router.get('/posts/all',  postController.getAllPosts); // only approved
router.get('/posts/search', postController.searchPosts);
router.get('/posts/:postId', postController.getPostById);

// Comment routes
router.post('/posts/:postId/comments', authenticate, commentController.addComment);
router.get('/posts/:postId/comments',commentController.getPostComments);
router.delete('/comments/:commentId', authenticate, commentController.deleteComment);
router.post('/comments/:commentId/report', authenticate, commentController.reportComment);

// Category routes
router.get('/categories', categoryController.getAllCategories);

// Admin routes
router.get('/admin/users', authenticate, isAdmin, adminController.getAllUsers);
router.post('/admin/accounts/manage', authenticate, isAdmin, adminController.manageUserAccount);
router.post('/admin/approvers', authenticate, isAdmin, adminController.registerApprover);
router.delete('/admin/approvers/:id', authenticate, adminController.removeApprover);
router.get('/admin/videos', authenticate, isAdmin, adminController.getAllVideos);
router.put('/admin/approve', authenticate, isAdmin, adminController.updatePostStatus);
router.get('/admin/approved/posts', authenticate, isAdmin, adminController.getApprovedPosts);
router.get('/admin/posts/pending', authenticate, isAdmin, adminController.getPendingPosts);
router.get('/admin/posts/rejected', authenticate, isAdmin, adminController.getRejectedPosts);
router.get('/admin/approvers/:approverId/approved-posts', authenticate, isAdmin, adminController.getAllApprovedPostsByApprover);
router.get('/admin/dashboard/stats', authenticate, isAdmin, adminController.getDashboardStats);
// router.get('/admin/users/stats', authenticate, isAdmin, adminController.getUsersStats);

// Approver routes
router.get('/approver/stats', authenticate, isApprover, approverController.getApproverStats);
router.get('/approver/posts/pending', authenticate, isApprover, approverController.getPendingPosts);
router.get('/approver/posts/approved', authenticate, isApprover, approverController.getApprovedPosts);
router.put('/approver/posts/:postId/approve', authenticate, isApprover, approverController.approvePost);
router.put('/approver/posts/:postId/reject', authenticate, isApprover, approverController.rejectPost);
router.get('/approver/notifications', authenticate, isApprover, approverController.getApproverNotifications);

// Subscription routes
router.post('/subscriptions/:userID', authenticate, subscriptionController.subscribe);
router.delete('/subscriptions/:userId', authenticate, subscriptionController.unsubscribe);
router.get('/subscriptions/subscribers', authenticate, subscriptionController.getSubscribers);

// Ad routes
router.get('/ads', authenticate, adController.getActiveAds);
router.delete('/ads/:adId', authenticate, isAdmin, adController.deleteAd);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router; 