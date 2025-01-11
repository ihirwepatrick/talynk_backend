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
        console.log('Token received:', token); // Debug log

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
        console.log('Decoded token:', decoded); // Debug log

        // Get user from database
        const user = await User.findByPk(decoded.id);
        console.log('Found user:', user ? user.id : 'not found'); // Debug log

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
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token expired'
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Authentication error'
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