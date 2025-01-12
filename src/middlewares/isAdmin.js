const isAdmin = (req, res, next) => {
    console.log('Checking admin privileges:', {
        user: req.user,
        role: req.user ? req.user.role : 'no role'
    });

    if (!req.user || req.user.role !== 'admin') {
        console.log('Access denied: User is not admin');
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

module.exports = isAdmin; 