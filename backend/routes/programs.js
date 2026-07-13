import { Router } from 'express';
import { getPrograms, getProgram, createProgram, updateProgram, deleteProgram } from '../controllers/programController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

// Public: get active programs
router.get('/', getPrograms);
router.get('/:id', getProgram);

// Admin: create, update, delete
router.post('/', protect, authorize('admin'), createProgram);
router.put('/:id', protect, authorize('admin'), updateProgram);
router.delete('/:id', protect, authorize('admin'), deleteProgram);

export default router;
