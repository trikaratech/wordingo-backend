import express from 'express';
import { body } from 'express-validator';
import {
  getReview,
  updateReview,
  deleteReview,
  upvoteReview,
  downvoteReview
} from '../controllers/bookReviewController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/:id', getReview);

// Protected routes
router.use(authenticate);

// Update review
router.put('/:id', [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1-5'),
  body('review')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be between 10-1000 characters')
], validate, updateReview);

// Delete review
router.delete('/:id', deleteReview);

// Vote on review
router.post('/:id/upvote', upvoteReview);
router.post('/:id/downvote', downvoteReview);

export default router;
