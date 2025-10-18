import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getBooks,
  createBook,
  updateBook,
  updateBookStatus,
  deleteBook,
  getEvents,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getAuthorsAdmin,
  getAuthorAdmin,
  updateAuthor,
  createAuthor,
  getAuthorsForDropdown,
  deleteAuthor
} from '../controllers/adminController.js';
import { adminAuth, superAdminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', superAdminAuth, deleteUser);

// Book management
router.get('/books', getBooks);
router.post('/books', createBook); // Add this
router.put('/books/:id', updateBook); // Add this
router.put('/books/:id/status', updateBookStatus);
router.delete('/books/:id', deleteBook);

// Event management
router.get('/events', getEvents);
router.post('/events', createEvent); // Add this
router.put('/events/:id', updateEvent); // Add this
router.put('/events/:id/status', updateEventStatus);
router.delete('/events/:id', deleteEvent);

// Author management
router.get('/authors', getAuthorsAdmin);
router.get('/authors/:id', getAuthorAdmin);
router.put('/authors/:id', updateAuthor);

// Author management
router.get('/authors', getAuthorsAdmin);
router.post('/authors', createAuthor); // Add this
router.get('/authors/list', getAuthorsForDropdown); // Add this
router.get('/authors/:id', getAuthorAdmin);
router.put('/authors/:id', updateAuthor);
router.delete('/authors/:id', deleteAuthor); // Add this
export default router;
