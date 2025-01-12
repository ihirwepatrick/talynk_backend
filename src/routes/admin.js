const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middlewares/authenticate');
const isAdmin = require('../middlewares/isAdmin');

// Add admin routes with authentication and admin check
router.get('/dashboard', authenticate, isAdmin, adminController.getDashboardData);

module.exports = router; 