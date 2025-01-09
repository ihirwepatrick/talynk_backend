const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { uploadFace } = require('../middlewares/upload');

// Auth routes
router.post('/register', uploadFace, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router; 