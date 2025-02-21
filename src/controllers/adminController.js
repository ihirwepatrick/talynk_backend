const { Post, User, Category, Like, Comment, Share, View, Admin, Approver, AccountManagement, Ad, Notification } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

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
        const [results] = await sequelize.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
                (SELECT COUNT(*) FROM approvers WHERE status = 'active') as total_approvers,
                (SELECT COUNT(*) FROM posts WHERE status = 'pending') as pending_videos,
                (SELECT COUNT(*) FROM posts WHERE status = 'approved') as approved_videos
        `);

        const stats = results[0];

        res.json({
            status: 'success',
            data: {
                totalUsers: parseInt(stats.total_users),
                totalApprovers: parseInt(stats.total_approvers),
                pendingVideos: parseInt(stats.pending_videos),
                approvedVideos: parseInt(stats.approved_videos)
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get dashboard stats'
        });
    }
};

// Account Management
exports.manageUserAccount = async (req, res) => {
    try {
        const { username, action } = req.body;
        await User.update(
            { status: action },
            { where: { username } }
        );
        res.json({
            status: 'success',
            message: `Account ${action} successfully`
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error managing account'
        });
    }
};

// Video Management
exports.getAllVideos = async (req, res) => {
    try {
        const videos = await Post.findAll({
            include: [{
                model: User,
                attributes: ['username']
            }]
        });
        res.json({
            status: 'success',
            data: { videos }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching videos'
        });
    }
};

// Approver Management
exports.registerApprover = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        await Approver.create({
            username,
            email,
            password // Assume password is hashed in a pre-save hook
        });
        res.json({
            status: 'success',
            message: 'Approver registered successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error registering approver'
        });
    }
};

exports.removeApprover = async (req, res) => {
    try {
        const { username } = req.params;
        await Approver.destroy({
            where: { username }
        });
        res.json({
            status: 'success',
            message: 'Approver removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error removing approver'
        });
    }
};

// Messaging
exports.sendMessageToAllUsers = async (req, res) => {
    try {
        const { message } = req.body;

        const users = await User.findAll({
            attributes: ['username']
        });

        await Promise.all(users.map(user => 
            Notification.create({
                userID: user.username,
                notification_text: message,
                notification_date: new Date()
            })
        ));

        res.json({
            status: 'success',
            message: 'Message sent to all users successfully'
        });
    } catch (error) {
        console.error('Message sending error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error sending message'
        });
    }
};

exports.sendMessageToApprovers = async (req, res) => {
    try {
        const { message } = req.body;

        const approvers = await Approver.findAll({
            attributes: ['username']
        });

        await Promise.all(approvers.map(approver => 
            Notification.create({
                userID: approver.username,
                notification_text: message,
                notification_date: new Date()
            })
        ));

        res.json({
            status: 'success',
            message: 'Message sent to all approvers successfully'
        });
    } catch (error) {
        console.error('Message sending error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error sending message'
        });
    }
};

// Statistics and Reports
exports.getAdminDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalApprovers,
            totalPosts,
            pendingPosts,
            approvedPosts
        ] = await Promise.all([
            User.count(),
            Approver.count(),
            Post.count(),
            Post.count({ where: { post_status: 'pending' } }),
            Post.count({ where: { post_status: 'approved' } })
        ]);

        res.json({
            status: 'success',
            data: {
                totalUsers,
                totalApprovers,
                totalPosts,
                pendingPosts,
                approvedPosts
            }
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching dashboard statistics'
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

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['username', 'email', 'createdAt']
        });
        res.json({
            status: 'success',
            data: { users }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users'
        });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const recentPosts = await Post.findAll({
            limit: 10,
            order: [['updatedAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['username']
                },
                {
                    model: Approver,
                    attributes: ['username']
                }
            ]
        });

        const activity = recentPosts.map(post => ({
            action: post.status === 'approved' ? 'Video Approved' : 
                    post.status === 'rejected' ? 'Video Rejected' : 
                    'Video Submitted',
            user: post.User?.username || 'Unknown User',
            approver: post.Approver?.username,
            details: `Video: ${post.title}`,
            date: post.updatedAt
        }));

        res.json({
            status: 'success',
            data: activity
        });
    } catch (error) {
        console.error('Error getting recent activity:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get recent activity'
        });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id', 'username', 'email', 'status', 'createdAt',
                [
                    sequelize.literal('(SELECT COUNT(*) FROM posts WHERE posts.user_id = User.id)'),
                    'totalVideos'
                ]
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: {
                users
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get users'
        });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.status = user.status === 'active' ? 'suspended' : 'active';
        await user.save();

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    status: user.status
                }
            }
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user status'
        });
    }
};

exports.getUserVideos = async (req, res) => {
    try {
        const { id } = req.params;
        const videos = await Post.findAll({
            where: { user_id: id },
            include: [
                {
                    model: Approver,
                    attributes: ['username']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: {
                videos
            }
        });
    } catch (error) {
        console.error('Error getting user videos:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get user videos'
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        await user.destroy();

        res.json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete user'
        });
    }
};

exports.getApprovers = async (req, res) => {
    try {
        const approvers = await Approver.findAll({
            attributes: [
                'id', 'username', 'email', 'status', 'createdAt',
                [
                    sequelize.literal('(SELECT COUNT(*) FROM posts WHERE posts.approver_id = Approver.id AND posts.status = \'approved\')'),
                    'videosApproved'
                ]
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: {
                approvers
            }
        });
    } catch (error) {
        console.error('Error getting approvers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get approvers'
        });
    }
};

exports.getVideos = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const videos = await Post.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['username', 'email']
                },
                {
                    model: Approver,
                    attributes: ['username']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            status: 'success',
            data: {
                videos: videos.rows,
                total: videos.count,
                pages: Math.ceil(videos.count / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error('Error getting videos:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get videos'
        });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.user.id, {
            attributes: [
                'id', 
                'username', 
                'email',
                'can_view_approved',
                'can_view_pending',
                'can_view_rejected',
                'ads_management',
                'can_view_all_approvers',
                'can_register_approvers',
                'can_manage_all_accounts'
            ]
        });

        if (!admin) {
            return res.status(404).json({
                status: 'error',
                message: 'Admin not found'
            });
        }

        // Format permissions object
        const permissions = {
            canViewApproved: admin.can_view_approved,
            canViewPending: admin.can_view_pending,
            canViewRejected: admin.can_view_rejected,
            adsManagement: admin.ads_management,
            canViewAllApprovers: admin.can_view_all_approvers,
            canRegisterApprovers: admin.can_register_approvers,
            canManageAllAccounts: admin.can_manage_all_accounts
        };

        res.json({
            status: 'success',
            data: {
                settings: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    permissions
                }
            }
        });
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get settings'
        });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { permissions } = req.body;
        const admin = await Admin.findByPk(req.user.id);

        if (!admin) {
            return res.status(404).json({
                status: 'error',
                message: 'Admin not found'
            });
        }

        // Update permissions
        await admin.update({
            can_view_approved: permissions.canViewApproved,
            can_view_pending: permissions.canViewPending,
            can_view_rejected: permissions.canViewRejected,
            ads_management: permissions.adsManagement,
            can_view_all_approvers: permissions.canViewAllApprovers,
            can_register_approvers: permissions.canRegisterApprovers,
            can_manage_all_accounts: permissions.canManageAllAccounts
        });

        res.json({
            status: 'success',
            data: {
                message: 'Settings updated successfully'
            }
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update settings'
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const admin = await Admin.findByPk(req.user.id);

        if (!admin) {
            return res.status(404).json({
                status: 'error',
                message: 'Admin not found'
            });
        }

        // Validate input
        if (!username || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and email are required'
            });
        }

        // Check if email is already taken by another admin
        if (email !== admin.email) {
            const existingAdmin = await Admin.findOne({ 
                where: { 
                    email,
                    id: { [sequelize.Op.ne]: admin.id }
                }
            });
            
            if (existingAdmin) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email already in use'
                });
            }
        }

        // Update profile
        await admin.update({
            username,
            email
        });

        res.json({
            status: 'success',
            data: {
                admin: {
                    username: admin.username,
                    email: admin.email
                }
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update profile'
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findByPk(req.user.id);

        if (!admin) {
            return res.status(404).json({
                status: 'error',
                message: 'Admin not found'
            });
        }

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Current password and new password are required'
            });
        }

        // Check current password
        // In production, use bcrypt.compare
        if (currentPassword !== admin.password) {
            return res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        // Update password
        // In production, use bcrypt.hash
        await admin.update({
            password: newPassword
        });

        res.json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update password'
        });
    }
}; 