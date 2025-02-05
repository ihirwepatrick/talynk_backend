const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user || user.isFrozen) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or frozen account'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
};

exports.requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized access'
            });
        }
        next();
    };
}; 