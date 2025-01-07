const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middlewares/validation');
const { uploadFaceImage } = require('../middlewares/upload');

router.post('/register', 
  uploadFaceImage,  // Middleware to handle face image upload
  validateRegistration,  // Middleware to validate registration data
  authController.register
);

module.exports = router; 