const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

router.use('/auth', authRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});


module.exports = router; 