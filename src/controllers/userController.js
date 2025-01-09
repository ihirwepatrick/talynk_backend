const { User, Post } = require('../models');

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: ['id', 'username', 'createdAt'],
      include: [{
        model: Post,
        as: 'posts',
        where: { status: 'approved' },
        required: false
      }]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user profile'
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { primaryPhone, secondaryPhone } = req.body;
    await User.update(
      { primaryPhone, secondaryPhone },
      { where: { id: req.user.id } }
    );
    res.json({
      status: 'success',
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile'
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.destroy({
      where: { id: req.user.id }
    });
    res.json({
      status: 'success',
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting account'
    });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { userId: req.user.id },
      include: ['category']
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
