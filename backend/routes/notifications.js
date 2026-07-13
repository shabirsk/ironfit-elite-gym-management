import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  createNotification,
  getAllNotificationsAdmin,
  getAdminNotificationStats,
  bulkActionNotifications
} from '../controllers/notificationController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

// Member-facing: protected, no admin check needed
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

// Admin: stats, bulk actions, and general management
router.get('/admin/stats', protect, authorize('admin'), getAdminNotificationStats);
router.post('/admin/bulk', protect, authorize('admin'), bulkActionNotifications);
router.get('/admin/all', protect, authorize('admin'), getAllNotificationsAdmin);
router.post('/', protect, authorize('admin'), createNotification);

export default router;
