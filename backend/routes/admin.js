import { Router } from 'express';
import { getDashboardStats, getAutomationLogs, runAutomation, sendTestEmail } from '../controllers/adminController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/automations', getAutomationLogs);
router.post('/automations/run/:name', runAutomation);
router.post('/test-email', sendTestEmail);

export default router;
