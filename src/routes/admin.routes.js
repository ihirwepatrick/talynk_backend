const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/posts/pending', authenticate, requireRole('admin'), adminController.getPendingPosts);
router.patch('/posts/:id/status', authenticate, requireRole('admin'), adminController.updatePostStatus);

module.exports = router; 