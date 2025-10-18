import express from 'express';
import { body } from 'express-validator';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  togglePostSave,
  getSavedPosts,
  getMyPosts,
  fixPublishedField // Add this import
} from '../controllers/postController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// IMPORTANT: Specific routes MUST come before parameterized routes like /:id

// Fix route (temporary) - comes first
router.post('/fix-published', fixPublishedField);

// User routes - come before /:id
router.get('/user/saved', authenticate, getSavedPosts);
router.get('/user/my-posts', authenticate, getMyPosts);

// Public routes (with optional auth for like/save status)
router.get('/', optionalAuth, getPosts);

// Protected routes start here
router.use(authenticate);

// CRUD operations
router.post('/', [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('content')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10-5000 characters'),
  body('category')
    .isIn(['Story', 'Poetry', 'Article', 'Review', 'Discussion', 'Other'])
    .withMessage('Invalid category')
], validate, createPost);

// Engagement routes - these need to come before /:id
router.put('/:id/like', togglePostLike);
router.put('/:id/save', togglePostSave);

// Individual post routes - MUST come last among /:id routes
router.get('/:id', optionalAuth, getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
