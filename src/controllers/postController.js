const { Post, Category, User } = require('../models');
const path = require('path');

exports.createPost = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'Media file is required'
            });
        }

        const { title, caption, categoryId } = req.body;

        // Validate required fields
        if (!title || !categoryId) {
            return res.status(400).json({
                status: 'error',
                message: 'Title and category are required'
            });
        }

        // Determine media type
        const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        
        // Create relative path for media URL
        const mediaUrl = path.join('uploads', 
            mediaType === 'video' ? 'videos' : 'images',
            req.file.filename
        ).replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes

        // Create post
        const post = await Post.create({
            title,
            caption,
            categoryId,
            mediaUrl,
            mediaType,
            userId: req.user.id, // From auth middleware
            status: 'pending'
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

        res.status(201).json({
            status: 'success',
            message: 'Post created successfully',
            data: createdPost
        });

    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating post',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 12, categoryId, sort = 'latest' } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const where = { status: 'approved' };
        if (categoryId) {
            where.categoryId = categoryId;
        }

        // Build order clause
        let order;
        switch (sort) {
            case 'oldest':
                order = [['createdAt', 'ASC']];
                break;
            case 'popular':
                order = [['views', 'DESC']]; // If you have a views column
                break;
            default: // 'latest'
                order = [['createdAt', 'DESC']];
        }

        const posts = await Post.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order,
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

        res.json({
            status: 'success',
            data: posts.rows,
            pagination: {
                total: posts.count,
                pages: Math.ceil(posts.count / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        const { id } = req.params;
        const { status } = req.body;

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

        await post.update({ status });

        res.json({
            status: 'success',
            message: 'Post status updated successfully',
            data: post
        });

    } catch (error) {
        console.error('Error updating post status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating post status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 