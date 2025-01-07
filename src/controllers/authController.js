const db = require('../models');
const { User } = db;
const { verifyFaceRecognition } = require('../utils/faceRecognition');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const {
      username,
      password,
      primaryPhone,
      secondaryPhone,
      interests = []
    } = req.body;

    const faceImage = req.file;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        username: username
      }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      password: hashedPassword,
      primaryPhone,
      secondaryPhone,
      faceImageUrl: faceImage ? faceImage.path : null
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          primaryPhone: user.primaryPhone,
          secondaryPhone: user.secondaryPhone
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during registration'
    });
  }
}; 