const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
    try {
        console.log('Authenticating request...');
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No token provided');
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token received:', token.substring(0, 20) + '...');

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
        console.log('Decoded token:', decoded);

        const user = await User.findByPk(decoded.id);
        console.log('Found user:', user ? `ID: ${user.id}, Admin: ${user.isAdmin}` : 'Not found');

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

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
        console.log('Checking admin status for user:', req.user.id);
        
        if (!req.user.isAdmin) {
            console.log('Access denied: User is not admin');
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
        }

        console.log('Admin access granted');
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error checking admin privileges'
        });
    }
}; 