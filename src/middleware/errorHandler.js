const { ValidationError } = require('sequelize');

exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof ValidationError) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'Token expired'
        });
    }

    // Default error
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};

// Not found handler
exports.notFound = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Resource not found'
    });
}; 