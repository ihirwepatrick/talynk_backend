const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { uploadFaceImage } = require('../middlewares/upload');

// Authentication routes
router.post('/register', uploadFaceImage, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router; 