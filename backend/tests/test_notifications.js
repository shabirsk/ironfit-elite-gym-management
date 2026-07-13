import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  validateStatus: () => true
});

async function runTest() {
  console.log("Starting Notifications Test...");
  await mongoose.connect('mongodb://127.0.0.1:27017/ironfit-elite');
  
  // 1. Admin Login
  let admin = await User.findOne({ email: 'admin@test.com' });
  if (!admin) {
    console.error("Admin not found.");
    process.exit(1);
  }
  admin.password = 'password123';
  await admin.save();
  const adminRes = await api.post('/auth/login', { email: 'admin@test.com', password: 'password123' });
  const adminHeaders = { Authorization: `Bearer ${adminRes.data.token}` };
  
  // 2. Member Login (use the one from the QR test)
  let testUser = await User.findOne({ email: { $regex: 'qrtest_' } });
  if (!testUser) {
    console.error("No test member found. Run test_qr.js first.");
    process.exit(1);
  }
  testUser.password = 'password123';
  await testUser.save();
  
  const memLogin = await api.post('/member-auth/login', { email: testUser.email, password: 'password123' });
  const memHeaders = { Authorization: `Bearer ${memLogin.data.token}` };
  
  // 3. Admin Creates a Notification for the Member
  console.log("Creating Notification from Admin to Member...");
  const createRes = await api.post('/notifications', {
    userId: testUser._id,
    title: "Test Notification Alert",
    message: "This is a real notification test!",
    type: "info"
  }, { headers: adminHeaders });
  
  console.log("Admin Create Notification Status:", createRes.status);
  
  // 4. Member Fetches Notifications
  console.log("Fetching Notifications for Member...");
  const fetchRes = await api.get('/notifications', { headers: memHeaders });
  console.log("Member Fetch Status:", fetchRes.status);
  
  if (fetchRes.status === 200) {
    const notifs = fetchRes.data.notifications || [];
    const testNotif = notifs.find(n => n.title === "Test Notification Alert");
    if (testNotif) {
      console.log("SUCCESS: Member received the notification!");
      console.log("Notification Data:", testNotif);
      
      // 5. Member marks as read
      const readRes = await api.put(`/notifications/${testNotif._id}/read`, {}, { headers: memHeaders });
      console.log("Mark as Read Status:", readRes.status);
      console.log("Read Status Updated:", readRes.data.read);
    } else {
      console.log("FAIL: Notification was not found in member's inbox.");
    }
  }

  process.exit(0);
}

runTest().catch(console.error);
