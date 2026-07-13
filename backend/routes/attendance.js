import { Router } from 'express';
import { getAttendance, markAttendance, updateAttendance, deleteAttendance, getAttendanceReport, scanAdminQRCode } from '../controllers/attendanceController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAttendance);
router.post('/', markAttendance);
router.post('/scan', scanAdminQRCode);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);
router.get('/report', getAttendanceReport);

export default router;
