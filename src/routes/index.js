const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./user');
const postRoutes = require('./post');
const categoryRoutes = require('./category');

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);

module.exports = router; 