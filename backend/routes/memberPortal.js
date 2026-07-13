import { Router } from 'express';
import {
  getDashboard,
  getMyAttendance,
  getMyPayments,
  getMySubscriptions,
  getMyWorkouts,
  updateWorkoutProgress,
  getMyDietPlans,
  getMyTrainer,
  generateQRCode,
  scanQRCode,
} from '../controllers/memberPortalController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/attendance', getMyAttendance);
router.get('/payments', getMyPayments);
router.get('/subscriptions', getMySubscriptions);
router.get('/workouts', getMyWorkouts);
router.put('/workouts/:id/progress', updateWorkoutProgress);
router.get('/diet-plans', getMyDietPlans);
router.get('/trainer', getMyTrainer);
router.get('/qr-code', generateQRCode);
router.post('/scan-qr', scanQRCode);

export default router;
