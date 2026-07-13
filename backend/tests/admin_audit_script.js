import axios from 'axios';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import FormData from 'form-data';
import User from './models/User.js';

// Define the base API URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  validateStatus: () => true
});

let results = [];

function recordResult(feature, apiPath, method, status, expectedStatus, data = null) {
  const pass = status === expectedStatus || (expectedStatus === 200 && status === 201);
  results.push({ feature, apiPath, method, status, expectedStatus, pass, data });
  if (!pass) {
    console.log(`[FAIL] ${feature} - ${method} ${apiPath} (Status: ${status}) Data: ${JSON.stringify(data)}`);
  } else {
    console.log(`[PASS] ${feature} - ${method} ${apiPath} (Status: ${status})`);
  }
}

async function runAudit() {
  console.log("Starting Full Admin Integration Audit...\n");

  await mongoose.connect('mongodb://127.0.0.1:27017/ironfit-elite');
  
  // Ensure admin user exists with correct password
  let admin = await User.findOne({ email: 'admin@test.com' });
  if (!admin) {
    admin = new User({ email: 'admin@test.com', fullName: 'Admin', role: 'admin' });
  }
  admin.password = 'password123';
  await admin.save();

  // 1. Admin Auth
  let adminToken;
  const loginRes = await api.post('/auth/login', { email: 'admin@test.com', password: 'password123' });
  recordResult('Admin Login', '/auth/login', 'POST', loginRes.status, 200);
  
  if (loginRes.data.token) {
    adminToken = loginRes.data.token;
  } else {
    // We already created admin@test.com in previous steps
    console.error("Admin login failed. Aborting.");
    process.exit(1);
  }
  const headers = { Authorization: `Bearer ${adminToken}` };

  // 2. Dashboard
  const dashRes = await api.get('/admin/stats', { headers });
  recordResult('Dashboard Stats', '/admin/stats', 'GET', dashRes.status, 200, dashRes.data);

  // 3. Plans Module
  const planRes = await api.post('/plans', {
    planName: 'Audit Audit Plan', price: 1500, duration: 60, features: ['Gym', 'Cardio']
  }, { headers });
  recordResult('Create Plan', '/plans', 'POST', planRes.status, 201, planRes.data);
  const planId = planRes.data._id;

  const planGetRes = await api.get('/plans', { headers });
  recordResult('List Plans', '/plans', 'GET', planGetRes.status, 200, planGetRes.data);

  const planPutRes = await api.put(`/plans/${planId || 'dummy'}`, { price: 1600 }, { headers });
  recordResult('Edit Plan', `/plans/${planId}`, 'PUT', planPutRes.status, 200, planPutRes.data);

  // 4. Trainers Module
  const trainerRes = await api.post('/trainers', {
    fullName: 'Audit Audit Trainer', email: `trainer_${Date.now()}@test.com`, phone: '5555555555', specialization: 'Yoga'
  }, { headers });
  recordResult('Create Trainer', '/trainers', 'POST', trainerRes.status, 201, trainerRes.data);
  const trainerId = trainerRes.data._id;

  const trainerGetRes = await api.get('/trainers', { headers });
  recordResult('List Trainers', '/trainers', 'GET', trainerGetRes.status, 200, trainerGetRes.data);

  // 5. Members Module
  const memberRes = await api.post('/members', {
    fullName: 'Audit Member', email: `member_${Date.now()}@test.com`, phone: '9999999999',
    gender: 'female', dob: '1990-01-01', planId, joiningDate: new Date()
  }, { headers });
  recordResult('Create Member', '/members', 'POST', memberRes.status, 201, memberRes.data);
  const memberId = memberRes.data._id;

  const memberGetRes = await api.get('/members', { headers });
  recordResult('List Members', '/members', 'GET', memberGetRes.status, 200, memberGetRes.data);

  const memberPutRes = await api.put(`/members/${memberId || 'dummy'}`, { trainerId }, { headers });
  recordResult('Assign Trainer (Edit Member)', `/members/${memberId}`, 'PUT', memberPutRes.status, 200, memberPutRes.data);

  // 6. Subscriptions
  // Wait, is there a direct subscription endpoint or is it handled by payments?
  const subRes = await api.post('/subscriptions', {
    memberId, planId, startDate: new Date()
  }, { headers });
  recordResult('Create Subscription', '/subscriptions', 'POST', subRes.status, 201, subRes.data);

  // 7. Attendance
  const attRes = await api.post('/attendance', {
    memberId, date: new Date(), status: 'present'
  }, { headers });
  recordResult('Mark Attendance', '/attendance', 'POST', attRes.status, 201, attRes.data);

  const attGetRes = await api.get('/attendance', { headers });
  recordResult('List Attendance', '/attendance', 'GET', attGetRes.status, 200, attGetRes.data);

  // 8. Payments
  const payRes = await api.post('/payments', {
    memberId, amount: 1500, paymentMethod: 'online', status: 'completed', paymentDate: new Date()
  }, { headers });
  recordResult('Create Payment', '/payments', 'POST', payRes.status, 201, payRes.data);

  const payGetRes = await api.get('/payments', { headers });
  recordResult('List Payments', '/payments', 'GET', payGetRes.status, 200, payGetRes.data);

  // 9. Workouts
  const workRes = await api.post('/workouts', {
    memberId, title: 'Full Body', startDate: new Date(), endDate: new Date(), durationWeeks: 4,
    exercises: [{ name: 'Squats', sets: 3, reps: 10 }]
  }, { headers });
  recordResult('Create Workout', '/workouts', 'POST', workRes.status, 201, workRes.data);

  // 10. Diet Plans
  const dietRes = await api.post('/diet-plans', {
    memberId, title: 'Weight Loss', startDate: new Date(), endDate: new Date(),
    meals: [{ time: 'Breakfast', name: 'Oats', calories: 300 }]
  }, { headers });
  recordResult('Create Diet Plan', '/diet-plans', 'POST', dietRes.status, 201, dietRes.data);

  // 11. Notifications
  const notifRes = await api.post('/notifications', {
    userId: memberId, title: 'Welcome', message: 'Hello!'
  }, { headers });
  recordResult('Create Notification', '/notifications', 'POST', notifRes.status, 201, notifRes.data);

  // 12. Email System
  const emailRes = await api.post('/admin/test-email', {}, { headers });
  recordResult('Test Email', '/admin/test-email', 'POST', emailRes.status, 200, emailRes.data);

  // 13. WhatsApp System
  const waRes = await api.get('/whatsapp/status', { headers });
  recordResult('WhatsApp Status', '/whatsapp/status', 'GET', waRes.status, 200, waRes.data);

  // 14. Settings / Profile
  const profileRes = await api.put('/auth/profile', { fullName: 'Admin Updated' }, { headers });
  recordResult('Update Admin Profile', '/auth/profile', 'PUT', profileRes.status, 200, profileRes.data);

  // 15. Exports
  const exportRes = await api.get('/exports/members/csv', { headers });
  recordResult('Export Members CSV', '/exports/members/csv', 'GET', exportRes.status, 200, exportRes.data);

  // Output Summary
  console.log("\n--- AUDIT SUMMARY ---");
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log("\nFAILURES:");
    results.filter(r => !r.pass).forEach(r => console.log(`- ${r.feature}: ${r.method} ${r.apiPath} returned ${r.status}`));
  }

  process.exit(0);
}

runAudit().catch(err => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
