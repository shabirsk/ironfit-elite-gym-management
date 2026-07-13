import { Router } from 'express';
import {
  getTrainers, getTrainer, createTrainer, updateTrainer, deleteTrainer, assignMembers,
} from '../controllers/trainerController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

// Public: get active trainers (for landing page, member assignment, etc.)
router.get('/', getTrainers);
router.get('/:id', getTrainer);

// Admin: create, update, delete, assign
router.post('/', protect, authorize('admin'), createTrainer);
router.put('/:id', protect, authorize('admin'), updateTrainer);
router.delete('/:id', protect, authorize('admin'), deleteTrainer);
router.put('/:id/assign-members', protect, authorize('admin'), assignMembers);

export default router;
