import express from 'express';
import { body } from 'express-validator';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyEvents,
  getRegisteredEvents
} from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.use(authenticate);

// Create event
router.post('/', [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10-2000 characters'),
  body('category')
    .isIn(['Poetry', 'Launch', 'Workshop', 'Discussion', 'Reading', 'Meetup', 'Conference', 'Other'])
    .withMessage('Invalid category'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
    .custom(date => {
      if (new Date(date) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
  body('time')
    .notEmpty()
    .withMessage('Event time is required'),
  body('location')
    .isLength({ min: 1, max: 300 })
    .withMessage('Location is required and must be less than 300 characters'),
  body('maxAttendees')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Maximum attendees must be between 1-10000'),
  body('onlineLink')
    .optional()
    .isURL()
    .withMessage('Valid URL required for online link')
], validate, createEvent);

// Update event
router.put('/:id', updateEvent);

// Event registration
router.post('/:id/register', registerForEvent);
router.delete('/:id/register', unregisterFromEvent);

// User events
router.get('/user/my-events', getMyEvents);
router.get('/user/registered', getRegisteredEvents);

export default router;
