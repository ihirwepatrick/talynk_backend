const { Admin } = require('../models');

exports.isAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findByPk(req.user.username);
        
        if (!admin) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error checking admin privileges'
        });
    }
}; 