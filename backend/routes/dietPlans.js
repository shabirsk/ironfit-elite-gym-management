import { Router } from 'express';
import {
  getDietPlans,
  getDietPlan,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
} from '../controllers/dietPlanController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

// Admin: full CRUD
router.get('/', protect, authorize('admin'), getDietPlans);
router.get('/:id', protect, authorize('admin'), getDietPlan);
router.post('/', protect, authorize('admin'), createDietPlan);
router.put('/:id', protect, authorize('admin'), updateDietPlan);
router.delete('/:id', protect, authorize('admin'), deleteDietPlan);

export default router;
