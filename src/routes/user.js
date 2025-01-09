const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

// Public routes
router.get('/profile/:username', userController.getPublicProfile);

// Protected routes
router.use(authenticate);
router.get('/me', userController.getMyProfile);
router.put('/me', userController.updateProfile);
router.delete('/me', userController.deleteAccount);
router.get('/me/posts', userController.getMyPosts);

module.exports = router; 