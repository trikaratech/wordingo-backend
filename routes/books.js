import express from 'express';
import { body } from 'express-validator';
import {
  getBooks,
  getBook,
  addBook,
  updateBook,
  getCategories,
  getTrendingBooks
} from '../controllers/bookController.js';
import {
  getBookReviews,
  addReview
} from '../controllers/bookReviewController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/trending', getTrendingBooks);
router.get('/:id', getBook);
router.get('/:bookId/reviews', getBookReviews);

// Protected routes
router.use(authenticate);

// Add book
router.post('/', [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('author')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author is required and must be less than 100 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10-2000 characters'),
  body('category')
    .isIn(['Fiction', 'Non-Fiction', 'Self-Help', 'Finance', 'History', 'Poetry', 'Biography', 'Science', 'Technology', 'Other'])
    .withMessage('Invalid category'),
  body('publishYear')
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Invalid publish year'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
], validate, addBook);

// Update book
router.put('/:id', updateBook);

// Add review
router.post('/:bookId/reviews', [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1-5'),
  body('review')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be between 10-1000 characters')
], validate, addReview);

export default router;
