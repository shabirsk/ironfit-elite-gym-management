import { Router } from 'express';
import {
  getSubscriptions, getSubscription, createSubscription,
  renewSubscription, cancelSubscription, updateSubscription, deleteSubscription,
} from '../controllers/subscriptionController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();
router.use(protect);
router.use(authorize('admin'));

router.get('/', getSubscriptions);
router.get('/:id', getSubscription);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.post('/:id/renew', renewSubscription);
router.post('/:id/cancel', cancelSubscription);

export default router;
