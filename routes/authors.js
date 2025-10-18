import express from 'express';
import { body } from 'express-validator';
import {
  getAuthors,
  getAuthor,
  rateAuthor,
  getMyAuthorRating
} from '../controllers/authorController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAuthors);
router.get('/:slug', getAuthor);

// Protected routes
router.use(authenticate);

// Rate author
router.post('/:slug/rate', [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1-5'),
  body('review')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters')
], validate, rateAuthor);

// Get user's rating for author
router.get('/:slug/my-rating', getMyAuthorRating);

export default router;
