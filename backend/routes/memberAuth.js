import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/memberAuthController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
