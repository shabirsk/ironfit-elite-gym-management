import { Router } from 'express';
import { getPlans, getPlan, createPlan, updatePlan, deletePlan } from '../controllers/planController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

// Public: get active plans
router.get('/', getPlans);
router.get('/:id', getPlan);

// Admin: create, update, delete
router.post('/', protect, authorize('admin'), createPlan);
router.put('/:id', protect, authorize('admin'), updatePlan);
router.delete('/:id', protect, authorize('admin'), deletePlan);

export default router;
