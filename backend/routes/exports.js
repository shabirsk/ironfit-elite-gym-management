import { Router } from 'express';
import {
  exportRevenueReport,
  exportAttendanceReport,
  exportMembersReport,
} from '../controllers/exportController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();
router.use(protect);
router.use(authorize('admin'));

router.get('/revenue/:format(pdf|excel|csv)', exportRevenueReport);
router.get('/attendance/:format(pdf|excel|csv)', exportAttendanceReport);
router.get('/members/:format(pdf|excel|csv)', exportMembersReport);

export default router;
