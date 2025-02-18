const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole, isAdmin } = require('../middleware/auth');

// Protected admin routes
router.use(authenticate, isAdmin);

// Get admin dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        res.json({
            status: 'success',
            data: {
                totalUsers: 100,
                pendingApprovals: 25,
                totalVideos: 500
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

router.get('/posts/pending', adminController.getPendingPosts);
router.patch('/posts/:id/status', adminController.updatePostStatus);

module.exports = router; 