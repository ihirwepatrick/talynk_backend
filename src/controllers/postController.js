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
        console.log('Getting all posts - User ID:', req.user.id);
        console.log('Is Admin:', req.user.isAdmin);

        // Build the query with specific attributes to exclude rejectionReason
        const queryOptions = {
            attributes: [
                'id', 
                'publicId', 
                'title', 
                'caption', 
                'mediaUrl', 
                'mediaType', 
                'status', 
                'userId', 
                'categoryId', 
                'createdAt', 
                'updatedAt'
            ],
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
        };

        console.log('Query options:', JSON.stringify(queryOptions, null, 2));

        const posts = await Post.findAll(queryOptions);

        console.log(`Found ${posts.length} posts`);
        posts.forEach(post => {
            console.log('Post:', {
                id: post.id,
                title: post.title,
                status: post.status,
                userId: post.userId,
                mediaUrl: post.mediaUrl
            });
        });

        res.json({
            status: 'success',
            data: posts
        });

    } catch (error) {
        console.error('Error in getAllPosts:', error);
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