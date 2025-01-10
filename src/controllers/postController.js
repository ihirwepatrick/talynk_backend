const { Post, User, Category } = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.createPost = async (req, res) => {
    try {
        console.log('Creating post with data:', req.body); // Debug log
        console.log('File:', req.file); // Debug log
        
        const { title, caption, categoryId } = req.body;

        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'Media file is required'
            });
        }

        // Determine media type
        const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        
        // Create post
        const post = await Post.create({
            publicId: uuidv4(),
            title,
            caption,
            mediaUrl: req.file.path,
            mediaType,
            status: 'pending', // Default status
            userId: req.user.id,
            categoryId
        });

        console.log('Post created:', post); // Debug log

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
        console.error('Error creating post:', error); // Debug log
        res.status(500).json({
            status: 'error',
            message: 'Error creating post',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        console.log('Fetching all posts'); // Debug log
        console.log('User:', req.user); // Debug log

        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { startDate, endDate } = req.query;
        
        // Build query conditions
        const whereConditions = {};
        if (startDate && endDate) {
            whereConditions.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const posts = await Post.findAll({
            where: whereConditions,
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

        console.log('Found posts:', posts.length); // Debug log

        res.json({
            status: 'success',
            data: posts
        });

    } catch (error) {
        console.error('Error fetching all posts:', error); // Debug log
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