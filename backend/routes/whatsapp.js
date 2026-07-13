import { Router } from 'express';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';
import {
  sendMessage,
  sendWelcome,
  sendReceipt,
  sendTrainerMsg,
  sendWorkoutMsg,
  getStatus,
} from '../controllers/whatsappController.js';

const router = Router();

// Status endpoint (no auth required)
router.get('/status', getStatus);

// Admin-only send endpoints
router.post('/send', protect, authorize('admin'), sendMessage);
router.post('/send-welcome', protect, authorize('admin'), sendWelcome);
router.post('/send-receipt', protect, authorize('admin'), sendReceipt);
router.post('/send-trainer-assignment', protect, authorize('admin'), sendTrainerMsg);
router.post('/send-workout-assignment', protect, authorize('admin'), sendWorkoutMsg);

export default router;
