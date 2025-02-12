const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AccountManagement } = require('../models');

// Authenticate user
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

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get user
        const user = await User.findByPk(decoded.username);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if account is active
        const accountStatus = await AccountManagement.findByPk(user.username);
        if (accountStatus && accountStatus.account_status !== 'active') {
            return res.status(403).json({
                status: 'error',
                message: `Account is ${accountStatus.account_status}`
            });
        }

        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
        console.error('Authentication error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error authenticating user'
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