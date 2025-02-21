const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticate, isAdmin);

// Dashboard routes
router.get('/stats', adminController.getDashboardStats);
router.get('/recent-activity', adminController.getRecentActivity);

// Approvers routes
router.get('/approvers', adminController.getApprovers);

// Users routes
router.get('/users', adminController.getUsers);

// Videos routes
router.get('/videos', adminController.getVideos);

// Settings routes
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.put('/profile', adminController.updateProfile);
router.put('/password', adminController.updatePassword);

module.exports = router; 