const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Authenticate user
exports.authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Add user to request
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

// Check user role
exports.requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }
        next();
    };
}; 