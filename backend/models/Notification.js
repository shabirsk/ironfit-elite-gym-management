import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
  },
  type: {
    type: String,
    enum: [
      'info', 'success', 'warning', 'error', 'alert', // Legacy types for backward compatibility
      'Payment', 'Membership', 'Attendance', 'Workout', 
      'Diet Plan', 'Lead', 'Contact Form', 'Subscription', 
      'Reminder', 'Renewal', 'Welcome Email', 'System'
    ],
    default: 'System',
  },
  link: {
    type: String,
    default: '',
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
