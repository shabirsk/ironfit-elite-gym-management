import { Router } from 'express';
import { getRenewalDashboard } from '../controllers/renewalController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();
router.use(protect);
router.use(authorize('admin'));

router.get('/', getRenewalDashboard);

export default router;
