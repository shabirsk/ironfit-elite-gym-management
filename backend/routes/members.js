import { Router } from 'express';
import { getMembers, getMember, createMember, updateMember, deleteMember, convertLeadToMember } from '../controllers/memberController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getMembers);
router.get('/:id', getMember);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);
router.post('/convert-lead/:leadId', convertLeadToMember);

export default router;
