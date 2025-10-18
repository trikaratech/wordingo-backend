import express from 'express';
import { sendOTP, verifyOTP, updateUserProfile, adminLogin } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/admin-login', adminLogin); // Add this line

router.put('/update-profile', authenticate, updateUserProfile);

export default router;
