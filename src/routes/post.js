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

// Add this route
router.get('/my-uploads', authenticate, async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Category,
                    as: 'category'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const processedPosts = posts.map(post => {
            const postObj = post.toJSON();
            // Ensure mediaUrl is properly formatted
            if (postObj.mediaUrl && !postObj.mediaUrl.startsWith('http')) {
                postObj.mediaUrl = postObj.mediaUrl.replace(/^uploads\//, '');
            }
            return postObj;
        });

        res.json({
            status: 'success',
            data: processedPosts
        });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
});

module.exports = router; 