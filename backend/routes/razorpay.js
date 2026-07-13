import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  refundPayment,
  listOrders,
} from '../controllers/razorpayController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

// Public: checkout flow (no auth — used during member signup/payment)
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

// Admin: manage Razorpay payments
router.get('/orders', protect, authorize('admin'), listOrders);
router.post('/refund/:paymentId', protect, authorize('admin'), refundPayment);

export default router;
