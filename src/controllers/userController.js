const { User, Post, Category } = require('../models');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Category,
                    as: 'selectedCategory',
                    attributes: ['id', 'name']
                }
            ]
        });

        // Get user stats
        const stats = await Post.findAndCountAll({
            where: { uploaderId: req.user.id },
            attributes: ['status'],
            group: ['status']
        });

        res.json({
            status: 'success',
            data: {
                ...user.toJSON(),
                stats: {
                    totalPosts: stats.count,
                    approvedPosts: stats.rows.find(r => r.status === 'approved')?.count || 0,
                    pendingPosts: stats.rows.find(r => r.status === 'pending')?.count || 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching profile'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { username, phone1, phone2, selectedCategoryId } = req.body;
        const user = await User.findByPk(req.user.id);

        await user.update({
            username,
            phone1,
            phone2,
            selectedCategoryId
        });

        res.json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                username: user.username,
                phone1: user.phone1,
                phone2: user.phone2,
                selectedCategoryId: user.selectedCategoryId
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating profile'
        });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
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
        console.error('Error getting current user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user data'
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });

        res.json({
            status: 'success',
            data: users
        });
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users'
        });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
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
        console.error('Error getting user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user'
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        const { username, primaryPhone, secondaryPhone, isAdmin } = req.body;
        await user.update({
            username,
            primaryPhone,
            secondaryPhone,
            isAdmin
        });

        res.json({
            status: 'success',
            message: 'User updated successfully',
            data: {
                id: user.id,
                username: user.username,
                primaryPhone: user.primaryPhone,
                secondaryPhone: user.secondaryPhone,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user'
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

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
            message: 'Error deleting user'
        });
    }
};
