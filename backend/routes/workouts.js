import { Router } from 'express';
import {
  getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout,
  assignToMember, updateProgress,
} from '../controllers/workoutController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getWorkouts);
router.get('/:id', getWorkout);
router.post('/', createWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);
router.put('/:id/assign', assignToMember);
router.put('/:id/progress', updateProgress);

export default router;
