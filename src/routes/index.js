const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const postRoutes = require('./post.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const categoryRoutes = require('./category.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);

module.exports = router; 