import { Router } from 'express';
import { getLeads, getLead, updateLead, deleteLead } from '../controllers/leadController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getLeads);
router.get('/:id', getLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
