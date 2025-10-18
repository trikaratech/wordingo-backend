import express from 'express';
import { getComments, createComment } from '../controllers/commentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:postId', getComments);
router.post('/:postId', authenticate, createComment);

export default router;
