const { Post, User, Category, Like, Comment, Share, View, Admin, Approver, AccountManagement, Ad } = require('../models');
const bcrypt = require('bcryptjs');

exports.getDashboardData = async (req, res) => {
    try {
        // Get counts for different post statuses
        const totalPosts = await Post.count();
        const pendingPosts = await Post.count({ where: { status: 'pending' } });
        const approvedPosts = await Post.count({ where: { status: 'approved' } });
        const rejectedPosts = await Post.count({ where: { status: 'rejected' } });

        // Get recent posts with their authors and categories
        const recentPosts = await Post.findAll({
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username']
                },
                {
                    model: Category,
                    as: 'category'
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        // Process media URLs for recent posts
        const processedPosts = recentPosts.map(post => {
            const postObj = post.toJSON();
            if (postObj.mediaUrl && !postObj.mediaUrl.startsWith('http')) {
                postObj.mediaUrl = `/uploads/${postObj.mediaUrl.replace(/^uploads\//, '')}`;
            }
            return postObj;
        });

        res.json({
            status: 'success',
            data: {
                stats: {
                    total: totalPosts,
                    pending: pendingPosts,
                    approved: approvedPosts,
                    rejected: rejectedPosts
                },
                recentPosts: processedPosts
            }
        });

    } catch (error) {
        console.error('Error in getDashboardData:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching dashboard data'
        });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { status = 'all' } = req.query;
        
        const where = {};
        if (status !== 'all') {
            where.status = status;
        }

        const posts = await Post.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'username']
                },
                {
                    model: Category,
                    as: 'category'
                },
                {
                    model: Like,
                    as: 'likes',
                    include: [{
                        model: User,
                        attributes: ['id', 'username']
                    }]
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [{
                        model: User,
                        attributes: ['id', 'username']
                    }]
                },
                {
                    model: Share,
                    as: 'shares',
                    include: [{
                        model: User,
                        attributes: ['id', 'username']
                    }]
                },
                {
                    model: View,
                    as: 'views',
                    include: [{
                        model: User,
                        attributes: ['id', 'username']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: posts
        });

    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
};

// Get pending posts
exports.getPendingPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: User,
                    as: 'uploader',
                    attributes: ['id', 'username']
                },
                {
                    model: Category,
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: { posts }
        });
    } catch (error) {
        console.error('Error getting pending posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching pending posts'
        });
    }
};

// Update post status (approve/reject)
exports.updatePostStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        if (status === 'rejected' && !rejectionReason) {
            return res.status(400).json({
                status: 'error',
                message: 'Rejection reason is required'
            });
        }

        await post.update({
            status,
            rejectionReason: status === 'rejected' ? rejectionReason : null,
            approverId: req.user.id,
            approvedAt: status === 'approved' ? new Date() : null
        });

        res.json({
            status: 'success',
            message: `Post ${status} successfully`
        });
    } catch (error) {
        console.error('Error updating post status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating post status'
        });
    }
};

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await Post.findAndCountAll({
            attributes: ['status'],
            group: ['status']
        });

        const userCount = await User.count();
        const categoryCount = await Category.count();

        res.json({
            status: 'success',
            data: {
                posts: {
                    total: stats.count,
                    pending: stats.rows.find(r => r.status === 'pending')?.count || 0,
                    approved: stats.rows.find(r => r.status === 'approved')?.count || 0,
                    rejected: stats.rows.find(r => r.status === 'rejected')?.count || 0
                },
                users: userCount,
                categories: categoryCount
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching dashboard stats'
        });
    }
};

exports.registerApprover = async (req, res) => {
    try {
        const adminUsername = req.user.username;
        const { username, email, password, phone1, phone2 } = req.body;

        // Check admin permissions
        const admin = await Admin.findByPk(adminUsername);
        if (!admin.can_register_approvers) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to register approvers'
            });
        }

        // Create user first
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            phone1,
            phone2
        });

        // Create approver
        await Approver.create({
            username: user.username
        });

        res.status(201).json({
            status: 'success',
            message: 'Approver registered successfully'
        });
    } catch (error) {
        console.error('Approver registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error registering approver'
        });
    }
};

exports.manageAccount = async (req, res) => {
    try {
        const adminUsername = req.user.username;
        const { username, action } = req.body;

        const admin = await Admin.findByPk(adminUsername);
        if (!admin.can_manage_all_accounts) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to manage accounts'
            });
        }

        await AccountManagement.upsert({
            accountID: username,
            account_status: action,
            [action === 'freezed' ? 'freeze_date' : 'delete_date']: new Date()
        });

        res.json({
            status: 'success',
            message: `Account ${action} successfully`
        });
    } catch (error) {
        console.error('Account management error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error managing account'
        });
    }
};

exports.uploadAd = async (req, res) => {
    try {
        const adminUsername = req.user.username;
        
        const admin = await Admin.findByPk(adminUsername);
        if (!admin.ads_management) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to manage ads'
            });
        }

        await Ad.create({
            uploaderID: adminUsername,
            ad_video: req.file.buffer,
            status: 'active'
        });

        res.status(201).json({
            status: 'success',
            message: 'Ad uploaded successfully'
        });
    } catch (error) {
        console.error('Ad upload error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error uploading ad'
        });
    }
}; 