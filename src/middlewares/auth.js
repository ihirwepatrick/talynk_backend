const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');

        // Get user from database
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
        }
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error checking admin privileges'
        });
    }
}; 