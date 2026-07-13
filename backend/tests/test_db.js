import mongoose from 'mongoose';
import Notification from './models/Notification.js';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const search = 'shaik shabir';
  const matchingUsers = await User.find({
    $or: [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }).select('_id');
  
  const userIds = matchingUsers.map(u => u._id);
  console.log('Matching Users length:', userIds.length);

  const query = {
    isArchived: false,
    read: false,
    type: 'Reminder',
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
      { userId: { $in: userIds } }
    ]
  };

  const notifs = await Notification.find(query).populate('userId', 'fullName email');
  console.log('Found Notifications with filters:', notifs.length);

  // Let's check WITHOUT filters for this user
  const allUserNotifs = await Notification.find({ userId: { $in: userIds } }).populate('userId', 'fullName');
  console.log('All Notifications for matching user:', allUserNotifs.length);
  if (allUserNotifs.length > 0) {
    console.log('Types of user notifications:', [...new Set(allUserNotifs.map(n => n.type))]);
  }

  // All notifications total
  const total = await Notification.countDocuments();
  console.log('Total notifications in DB:', total);

  mongoose.disconnect();
}

check().catch(console.error);
