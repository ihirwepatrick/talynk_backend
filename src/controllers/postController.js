const { Post, User, Category } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

exports.createPost = async (req, res) => {
    try {
        upload.single('media')(req, res, async function(err) {
            if (err) {
                console.error('Upload error:', err);
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file uploaded'
                });
            }

            const { title, categoryId } = req.body;
            
            if (!title || !categoryId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Title and category are required'
                });
            }

            const post = await Post.create({
                title,
                mediaUrl: req.file.filename,
                mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
                status: 'pending',
                userId: req.user.id,
                categoryId
            });

            res.status(201).json({
                status: 'success',
                data: post
            });
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating post'
        });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        console.log('Fetching all posts...');
        const posts = await Post.findAll({
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
            order: [['createdAt', 'DESC']]
        });

        // Process media URLs
        const processedPosts = posts.map(post => {
            const postObj = post.toJSON();
            // Log the original mediaUrl
            console.log('Original mediaUrl:', postObj.mediaUrl);
            
            // Ensure the mediaUrl is properly formatted for the uploads directory
            if (postObj.mediaUrl && !postObj.mediaUrl.startsWith('http')) {
                postObj.mediaUrl = `/uploads/${postObj.mediaUrl.replace(/^uploads\//, '')}`;
            }
            
            // Log the processed mediaUrl
            console.log('Processed mediaUrl:', postObj.mediaUrl);
            return postObj;
        });

        // Get statistics
        const stats = {
            total: posts.length,
            pending: posts.filter(p => p.status === 'pending').length,
            approved: posts.filter(p => p.status === 'approved').length,
            rejected: posts.filter(p => p.status === 'rejected').length
        };

        res.json({
            status: 'success',
            stats,
            data: processedPosts
        });

    } catch (error) {
        console.error('Error in getAllPosts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
};

exports.getPostsByUser = async (req, res) => {
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

        res.json({
            status: 'success',
            data: posts
        });

    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user posts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getPendingPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: { status: 'pending' },
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
            order: [['createdAt', 'DESC']]
        });

        // Process media URLs
        const processedPosts = posts.map(post => {
            const postObj = post.toJSON();
            if (postObj.mediaUrl && !postObj.mediaUrl.startsWith('http')) {
                postObj.mediaUrl = `/uploads/${postObj.mediaUrl.replace(/^uploads\//, '')}`;
            }
            return postObj;
        });

        res.json({
            status: 'success',
            data: processedPosts
        });

    } catch (error) {
        console.error('Error fetching pending posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
};

exports.updatePostStatus = async (req, res) => {
    try {
        console.log('Updating post status:', req.params.id, req.body); // Debug log

        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status value'
            });
        }

        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        const updateData = { status };
        if (status === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        await post.update(updateData);

        // Fetch updated post with associations
        const updatedPost = await Post.findByPk(id, {
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
            ]
        });

        console.log('Post updated:', updatedPost); // Debug log

        res.json({
            status: 'success',
            message: 'Post status updated successfully',
            data: updatedPost
        });

    } catch (error) {
        console.error('Error updating post status:', error); // Debug log
        res.status(500).json({
            status: 'error',
            message: 'Error updating post status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getUserPendingPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: {
                userId: req.user.id,
                status: 'pending'
            },
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
            order: [['createdAt', 'DESC']]
        });

        console.log(`Found ${posts.length} pending posts for user ${req.user.id}`);

        res.json({
            status: 'success',
            data: posts
        });

    } catch (error) {
        console.error('Error fetching user pending posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching pending posts'
        });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: {
                userId: req.user.id
            },
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
            order: [['createdAt', 'DESC']]
        });

        // Process media URLs
        const processedPosts = posts.map(post => {
            const postObj = post.toJSON();
            if (postObj.mediaUrl && !postObj.mediaUrl.startsWith('http')) {
                postObj.mediaUrl = `/uploads/${postObj.mediaUrl.replace(/^uploads\//, '')}`;
            }
            return postObj;
        });

        res.json({
            status: 'success',
            data: processedPosts
        });

    } catch (error) {
        console.error('Error in getUserPosts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user posts'
        });
    }
};

exports.getApprovedPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: { status: 'approved' },
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
            order: [['createdAt', 'DESC']]
        });

        const processedPosts = posts.map(post => {
            const postObj = post.toJSON();
            if (postObj.mediaUrl && !postObj.mediaUrl.startsWith('http')) {
                postObj.mediaUrl = `/uploads/${postObj.mediaUrl.replace(/^uploads\//, '')}`;
            }
            return postObj;
        });

        res.json({
            status: 'success',
            data: processedPosts
        });

    } catch (error) {
        console.error('Error fetching approved posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found or unauthorized'
            });
        }

        await post.destroy();

        res.json({
            status: 'success',
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting post'
        });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const categoryId = req.query.category || null;
        const sort = req.query.sort || 'latest';

        let whereClause = {
            status: 'approved'
        };

        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        const order = sort === 'oldest' ? [['createdAt', 'ASC']] : [['createdAt', 'DESC']];

        const posts = await Post.findAll({
            where: whereClause,
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
            order: order,
            limit: limit,
            offset: offset
        });

        const processedPosts = posts.map(post => {
            const postObj = post.toJSON();
            if (postObj.mediaUrl && !postObj.mediaUrl.startsWith('http')) {
                postObj.mediaUrl = `/uploads/${postObj.mediaUrl.replace(/^uploads\//, '')}`;
            }
            return postObj;
        });

        res.json({
            status: 'success',
            data: processedPosts,
            pagination: {
                page,
                limit,
                hasMore: posts.length === limit
            }
        });

    } catch (error) {
        console.error('Error in getPosts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
};

exports.getUserApprovedPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: {
                userId: req.user.id,
                status: 'approved'
            },
            include: [
                {
                    model: Category,
                    as: 'category'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: posts
        });
    } catch (error) {
        console.error('Error fetching approved posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
};

exports.getUserRejectedPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: {
                userId: req.user.id,
                status: 'rejected'
            },
            include: [
                {
                    model: Category,
                    as: 'category'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: posts
        });
    } catch (error) {
        console.error('Error fetching rejected posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
};

exports.getRejectedPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: { status: 'rejected' },
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
            order: [['createdAt', 'DESC']]
        });

        const processedPosts = posts.map(post => {
            const postObj = post.toJSON();
            if (postObj.mediaUrl && !postObj.mediaUrl.startsWith('http')) {
                postObj.mediaUrl = `/uploads/${postObj.mediaUrl.replace(/^uploads\//, '')}`;
            }
            return postObj;
        });

        res.json({
            status: 'success',
            data: processedPosts
        });

    } catch (error) {
        console.error('Error fetching rejected posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
};

exports.approvePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        await post.update({ status: 'approved' });

        res.json({
            status: 'success',
            message: 'Post approved successfully',
            data: post
        });

    } catch (error) {
        console.error('Error approving post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error approving post'
        });
    }
};

exports.rejectPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { reason } = req.body;

        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        await post.update({ 
            status: 'rejected',
            rejectionReason: reason
        });

        res.json({
            status: 'success',
            message: 'Post rejected successfully',
            data: post
        });

    } catch (error) {
        console.error('Error rejecting post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error rejecting post'
        });
    }
}; 