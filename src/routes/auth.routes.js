const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { Admin, Approver } = require('../models');

// Auth routes
router.post('/register', authController.register);
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        let user;
        if (role === 'admin') {
            user = await Admin.findOne({ where: { email } });
        } else if (role === 'approver') {
            user = await Approver.findOne({ where: { email } });
        }

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // For testing purposes - replace with proper password verification
        const token = jwt.sign(
            { id: user.id, role: role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            status: 'success',
            data: {
                token,
                user: {
                    email: user.email,
                    role: role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router; 