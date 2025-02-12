const { Post, User, Category } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

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
        const { title, caption, post_category } = req.body;
        const uploaderID = req.user.username; // From auth middleware

        const result = await db.query(
            `INSERT INTO posts (
                uploaderID, 
                post_status, 
                post_category, 
                title,
                caption,
                uploadDate,
                type,
                likes,
                comments,
                views,
                shares,
                saves
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, 0, 0, 0, 0, 0)
            RETURNING *`,
            [uploaderID, 'pending', post_category, title, caption, req.file ? req.file.mimetype.split('/')[0] : 'image']
        );

        // Update user's post count
        await db.query(
            'UPDATE users SET posts_count = posts_count + 1 WHERE username = $1',
            [uploaderID]
        );

        res.status(201).json({
            status: 'success',
            data: {
                post: result.rows[0]
            }
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
        const posts = await Post.findAll({
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
            ]
        });

        res.json({
            status: 'success',
            data: { posts }
        });
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching posts'
        });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, {
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
            ]
        });

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        res.json({
            status: 'success',
            data: { post }
        });
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching post'
        });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findOne({
            where: { 
                id: req.params.id,
                uploaderId: req.user.id
            }
        });

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        await post.update(req.body);

        res.json({
            status: 'success',
            data: { post }
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating post'
        });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const username = req.user.username;

        // Check if post exists and belongs to user
        const postCheck = await db.query(
            'SELECT * FROM posts WHERE uniqueTraceability_id = $1 AND uploaderID = $2',
            [postId, username]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found or unauthorized'
            });
        }

        // Delete related records first
        await db.query('DELETE FROM post_likes WHERE postID = $1', [postId]);
        await db.query('DELETE FROM comments WHERE postID = $1', [postId]);
        
        // Delete the post
        await db.query('DELETE FROM posts WHERE uniqueTraceability_id = $1', [postId]);

        // Update user's post count
        await db.query(
            'UPDATE users SET posts_count = posts_count - 1 WHERE username = $1',
            [username]
        );

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
        const username = req.user.username;

        const result = await db.query(
            `SELECT p.*, 
                    COUNT(pl.userID) as like_count,
                    COUNT(c.commentID) as comment_count
             FROM posts p
             LEFT JOIN post_likes pl ON p.uniqueTraceability_id = pl.postID
             LEFT JOIN comments c ON p.uniqueTraceability_id = c.postID
             WHERE p.uploaderID = $1
             GROUP BY p.uniqueTraceability_id
             ORDER BY p.uploadDate DESC`,
            [username]
        );

        res.json({
            status: 'success',
            data: {
                posts: result.rows
            }
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

exports.getPost = async (req, res) => {
    try {
        const post = await Post.findOne({
            where: { 
                id: req.params.id,
                uploaderId: req.user.id
            }
        });

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        res.json({
            status: 'success',
            data: { post }
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching post'
        });
    }
};

exports.likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const username = req.user.username;

        // Check if already liked
        const likeCheck = await db.query(
            'SELECT * FROM post_likes WHERE postID = $1 AND userID = $2',
            [postId, username]
        );

        if (likeCheck.rows.length > 0) {
            // Unlike
            await db.query(
                'DELETE FROM post_likes WHERE postID = $1 AND userID = $2',
                [postId, username]
            );
            await db.query(
                'UPDATE posts SET likes = likes - 1 WHERE uniqueTraceability_id = $1',
                [postId]
            );
        } else {
            // Like
            await db.query(
                'INSERT INTO post_likes (userID, postID) VALUES ($1, $2)',
                [username, postId]
            );
            await db.query(
                'UPDATE posts SET likes = likes + 1 WHERE uniqueTraceability_id = $1',
                [postId]
            );
        }

        res.json({
            status: 'success',
            message: likeCheck.rows.length > 0 ? 'Post unliked' : 'Post liked'
        });
    } catch (error) {
        console.error('Error liking/unliking post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error processing like/unlike'
        });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { commentText } = req.body;
        const username = req.user.username;

        const result = await db.query(
            `INSERT INTO comments (
                commentorID, 
                postID, 
                commentText
            ) VALUES ($1, $2, $3)
            RETURNING *`,
            [username, postId, commentText]
        );

        // Update post's comment count
        await db.query(
            'UPDATE posts SET comments = comments + 1 WHERE uniqueTraceability_id = $1',
            [postId]
        );

        res.status(201).json({
            status: 'success',
            data: {
                comment: result.rows[0]
            }
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding comment'
        });
    }
};

exports.getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const result = await db.query(
            `SELECT c.*, u.username 
             FROM comments c
             JOIN users u ON c.commentorID = u.username
             WHERE c.postID = $1
             ORDER BY c.commentDate DESC`,
            [postId]
        );

        res.json({
            status: 'success',
            data: {
                comments: result.rows
            }
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching comments'
        });
    }
}; 