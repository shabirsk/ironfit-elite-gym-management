import { Router } from 'express';
import { getPayments, getPayment, recordPayment, getPaymentReports } from '../controllers/paymentController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();
router.use(protect);
router.use(authorize('admin'));

router.get('/', getPayments);
router.get('/reports', getPaymentReports);
router.get('/:id', getPayment);
router.post('/', recordPayment);

export default router;
