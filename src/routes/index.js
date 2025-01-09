const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const postRoutes = require('./post');
const categoryRoutes = require('./category');

// Mount routes
router.use('/auth', authRoutes);
router.use('/', postRoutes); // Post routes are mounted at the root
router.use('/categories', categoryRoutes);

module.exports = router; 