const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

router.get('/', postController.getAllPosts);
router.post('/', authenticate, postController.createPost);
router.get('/:id', postController.getPostById);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

module.exports = router; 