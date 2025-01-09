const { Post, Category } = require('../models');

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: 'approved' },
      include: ['author', 'category']
    });
    res.json({
      status: 'success',
      data: posts
    });
  } catch (error) {
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
        status: 'approved'
      },
      include: ['author', 'category']
    });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    res.json({
      status: 'success',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching post'
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, description, categoryId } = req.body;
    const mediaUrl = req.file ? req.file.path : null;
    const mediaType = req.file ? 
      (req.file.mimetype.startsWith('video/') ? 'video' : 'picture') : 
      null;

    const post = await Post.create({
      title,
      description,
      mediaUrl,
      mediaType,
      userId: req.user.id,
      categoryId,
      status: 'pending' // All new posts start as pending
    });

    res.status(201).json({
      status: 'success',
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating post'
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, description } = req.body;
    const post = await Post.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    await post.update({ 
      title, 
      description,
      status: 'pending' // Reset to pending when updated
    });

    res.json({
      status: 'success',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating post'
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const result = await Post.destroy({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting post'
    });
  }
};

exports.updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value'
      });
    }

    await post.update({ status });

    res.json({
      status: 'success',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating post status'
    });
  }
}; 