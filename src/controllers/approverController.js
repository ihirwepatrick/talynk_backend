const { Approver, Post, Notification } = require('../models');

exports.getPendingPosts = async (req, res) => {
    try {
        const approverUsername = req.user.username;
        
        const approver = await Approver.findByPk(approverUsername);
        if (!approver.can_view_pending) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to view pending posts'
            });
        }

        const posts = await Post.findAll({
            where: { post_status: 'pending' },
            include: [{
                model: User,
                attributes: ['username', 'email']
            }],
            order: [['uploadDate', 'DESC']]
        });

        res.json({
            status: 'success',
            data: { posts }
        });
    } catch (error) {
        console.error('Pending posts fetch error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching pending posts'
        });
    }
};

exports.approvePost = async (req, res) => {
    try {
        const approverUsername = req.user.username;
        const { postId } = req.params;

        const post = await Post.findByPk(postId);
        if (!post || post.post_status !== 'pending') {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found or already processed'
            });
        }

        await post.update({
            post_status: 'approved',
            approverID: approverUsername,
            approvedDate: new Date()
        });

        // Notify post owner
        await Notification.create({
            userID: post.uploaderID,
            notification_text: 'Your post has been approved',
            notification_date: new Date()
        });

        res.json({
            status: 'success',
            message: 'Post approved successfully'
        });
    } catch (error) {
        console.error('Post approval error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error approving post'
        });
    }
}; 