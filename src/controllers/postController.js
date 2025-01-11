const { Post, User, Category } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

exports.createPost = async (req, res) => {
    try {
        console.log('=== Creating Post ===');
        console.log('User:', req.user.id);
        console.log('Request body:', req.body);
        console.log('File:', req.file);

        const { title, caption, categoryId } = req.body;

        // Validate required fields
        if (!title || !categoryId) {
            console.log('Missing required fields');
            return res.status(400).json({
                status: 'error',
                message: 'Title and category are required'
            });
        }

        if (!req.file) {
            console.log('No media file provided');
            return res.status(400).json({
                status: 'error',
                message: 'Media file is required'
            });
        }

        // Create the post
        const post = await Post.create({
            publicId: uuidv4(),
            title,
            caption,
            mediaUrl: req.file.path.replace(/\\/g, '/'), // Normalize path for Windows
            mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
            status: 'pending',
            userId: req.user.id,
            categoryId: parseInt(categoryId)
        });

        console.log('Post created successfully:', {
            id: post.id,
            title: post.title,
            mediaUrl: post.mediaUrl,
            userId: post.userId,
            categoryId: post.categoryId
        });

        // Fetch the created post with associations
        const createdPost = await Post.findByPk(post.id, {
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

        console.log('Fetched created post with associations:', createdPost);

        res.status(201).json({
            status: 'success',
            message: 'Post created successfully',
            data: createdPost
        });

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating post',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        // Ensure user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        const { startDate, endDate } = req.query;
        
        let whereClause = {};
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

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
            order: [['createdAt', 'DESC']]
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
            data: posts
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

        res.json({
            status: 'success',
            data: posts
        });

    } catch (error) {
        console.error('Error fetching pending posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching pending posts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

        res.json({
            status: 'success',
            data: posts
        });

    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
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