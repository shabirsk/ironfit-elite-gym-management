import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ userId: req.user._id, isArchived: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments({ userId: req.user._id, isArchived: false });
    const unread = await Notification.countDocuments({ userId: req.user._id, read: false, isArchived: false });

    res.json({ notifications, total, unread, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllNotificationsAdmin = async (req, res) => {
  try {
    const { search, type, status, archived = 'false', sort = 'newest' } = req.query;
    
    let query = {};
    
    if (archived !== 'all') {
      query.isArchived = archived === 'true';
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (status === 'unread') query.read = false;
    if (status === 'read') query.read = true;

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'unread') sortObj = { read: 1, createdAt: -1 };
    if (sort === 'read') sortObj = { read: -1, createdAt: -1 };

    const notifications = await Notification.find(query)
      .populate('userId', 'fullName email profileImage')
      .sort(sortObj);
      
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminNotificationStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = await Notification.countDocuments();
    const unread = await Notification.countDocuments({ read: false });
    const todays = await Notification.countDocuments({ createdAt: { $gte: today } });
    const archived = await Notification.countDocuments({ isArchived: true });
    const payments = await Notification.countDocuments({ type: 'Payment', createdAt: { $gte: today } });
    const renewals = await Notification.countDocuments({ type: 'Renewal', createdAt: { $gte: today } });

    res.json({ total, unread, todays, archived, payments, renewals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkActionNotifications = async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty IDs array' });
    }

    switch (action) {
      case 'read':
        await Notification.updateMany({ _id: { $in: ids } }, { read: true, readAt: new Date() });
        break;
      case 'unread':
        await Notification.updateMany({ _id: { $in: ids } }, { read: false, readAt: null });
        break;
      case 'archive':
        await Notification.updateMany({ _id: { $in: ids } }, { isArchived: true });
        break;
      case 'unarchive':
        await Notification.updateMany({ _id: { $in: ids } }, { isArchived: false });
        break;
      case 'delete':
        await Notification.deleteMany({ _id: { $in: ids } });
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ message: `Successfully executed bulk ${action}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false, isArchived: false },
      { read: true, readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false, isArchived: false });
    res.json({ unread: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }
    const notification = await Notification.findOneAndDelete(query);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import { sendEmailWithLog } from '../lib/email.js';

// Admin helper to create notification for a user
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message are required' });
    }
    
    // Save in DB
    const notification = await Notification.create({ userId, title, message, type, link });
    
    // Try to send an actual email
    try {
      const targetUser = await User.findById(userId);
      if (targetUser && targetUser.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #000;">${title}</h2>
            <p style="font-size: 16px; line-height: 1.5;">${message}</p>
            ${link ? `<a href="${link}" style="display: inline-block; padding: 10px 20px; background: #ff6200; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Details</a>` : ''}
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888;">This is an automated notification from IronFit Elite.</p>
          </div>
        `;
        await sendEmailWithLog({
          to: targetUser.email,
          subject: title,
          html: emailHtml,
          category: 'system',
          automation: type || 'system'
        });
      }
    } catch (emailErr) {
      console.error('[Notification] Failed to send email:', emailErr.message);
    }

    res.status(201).json(notification);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: error.message });
  }
};
