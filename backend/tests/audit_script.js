import axios from 'axios';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Member from './models/Member.js';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  validateStatus: () => true
});

async function runAudit() {
  console.log("Starting Integration Audit...");
  
  await mongoose.connect('mongodb://127.0.0.1:27017/ironfit-elite');
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({ email: 'admin@test.com', password: 'password123', fullName: 'Admin', role: 'admin' });
  }
  const adminToken = jwt.sign({ id: admin._id }, 'ironfit_jwt_secret_dev_2026', { expiresIn: '7d' });
  
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  
  // 2. Create Plan
  const planRes = await api.post('/plans', {
    name: 'Audit Plan', price: 1000, duration: 30, features: ['Gym']
  }, { headers: adminHeaders });
  const planId = planRes.data._id;
  
  // 3. Create Trainer
  const trainerRes = await api.post('/trainers', {
    fullName: 'Audit Trainer', email: `audittrainer_${Date.now()}@test.com`, phone: '1234567890', specialization: 'Fitness'
  }, { headers: adminHeaders });
  const trainerId = trainerRes.data._id;
  
  // 4. Create Member
  const memberEmail = `shaik_${Date.now()}@test.com`;
  const memberRes = await api.post('/members', {
    fullName: 'SHAIK', email: memberEmail, phone: '9876543210', gender: 'male',
    dob: '1995-01-01', height: 175, weight: 70, bloodGroup: 'O+', planId, joiningDate: new Date()
  }, { headers: adminHeaders });
  
  const memberId = memberRes.data._id;
  console.log("Created Member:", memberId ? "SUCCESS" : "FAIL");
  
  if (!memberId) {
    console.error(memberRes.data);
    process.exit(1);
  }
  
  // Assign Trainer via PUT
  await api.put(`/members/${memberId}`, { trainerId }, { headers: adminHeaders });
  
  // 6. Create Workout
  const workoutRes = await api.post('/workouts', {
    memberId,
    title: 'Audit Workout',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    durationWeeks: 4,
    exercises: [{ name: 'Pushups', sets: 3, reps: 15 }]
  }, { headers: adminHeaders });
  if (workoutRes.data._id) {
    console.log("Created Workout: SUCCESS");
  } else {
    console.log("Created Workout: FAIL", workoutRes.data);
  }
  
  // 7. Create Diet Plan
  const dietRes = await api.post('/diet-plans', {
    memberId,
    title: 'Audit Diet',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    meals: [{ time: 'Breakfast', name: 'Eggs', calories: 200, notes: 'Boiled' }]
  }, { headers: adminHeaders });
  console.log("Created Diet Plan:", dietRes.data._id ? "SUCCESS" : "FAIL");
  
  // 8. Create Notification
  const notifRes = await api.post('/notifications', {
    userId: memberId,
    title: 'Audit Notification',
    message: 'This is a test notification'
  }, { headers: adminHeaders });
  console.log("Created Notification:", notifRes.data._id ? "SUCCESS" : "FAIL");
  
  // 9. Mark Attendance
  const attRes = await api.post('/attendance', {
    memberId,
    date: new Date(),
    status: 'present',
    checkInTime: '10:00 AM'
  }, { headers: adminHeaders });
  console.log("Marked Attendance:", attRes.data._id ? "SUCCESS" : "FAIL");
  
  // 10. Create Payment
  const payRes = await api.post('/payments', {
    memberId,
    amount: 1000,
    paymentMethod: 'cash',
    status: 'completed',
    paymentDate: new Date(),
    planId
  }, { headers: adminHeaders });
  console.log("Created Payment:", payRes.data._id ? "SUCCESS" : "FAIL");
  
  // 11. Member Login
  // Overwrite password manually to test login endpoint
  const userDoc = await User.findOne({ email: memberEmail });
  if (!userDoc) {
    console.error("User document not created for member!");
    process.exit(1);
  }
  userDoc.password = 'password123';
  await userDoc.save();
  
  const loginRes = await api.post('/member-auth/login', { email: memberEmail, password: 'password123' });
  if (!loginRes.data.token) {
    console.error("Member login failed!", loginRes.data);
    process.exit(1);
  }
  console.log("Member Login: SUCCESS");
  
  const memberToken = loginRes.data.token;
  const memberHeaders = { Authorization: `Bearer ${memberToken}` };
  
  console.log("\n--- MEMBER PORTAL API AUDIT ---");
  
  const endpoints = {
    Dashboard: '/member/dashboard',
    Attendance: '/member/attendance',
    Payments: '/member/payments',
    Workouts: '/member/workouts',
    DietPlans: '/member/diet-plans',
    Notifications: '/notifications'
  };
  
  for (const [name, url] of Object.entries(endpoints)) {
    const res = await api.get(url, { headers: memberHeaders });
    console.log(`${name} API Status:`, res.status);
    if (res.status !== 200) {
      console.log(`  Error: ${JSON.stringify(res.data)}`);
    } else {
      const isArray = Array.isArray(res.data);
      console.log(`  Data: ${isArray ? res.data.length + ' records' : 'Object keys: ' + Object.keys(res.data).join(', ')}`);
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
