import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

router.post('/register', protect, authorize('admin'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
