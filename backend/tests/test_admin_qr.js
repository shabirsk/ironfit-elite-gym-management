import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  validateStatus: () => true
});

async function runTest() {
  console.log("Starting Admin QR Code Scan Test...");
  await mongoose.connect('mongodb://127.0.0.1:27017/ironfit-elite');
  
  let admin = await User.findOne({ email: 'admin@test.com' });
  admin.password = 'password123';
  await admin.save();
  const adminRes = await api.post('/auth/login', { email: 'admin@test.com', password: 'password123' });
  const adminHeaders = { Authorization: `Bearer ${adminRes.data.token}` };
  
  const email = `qrtest_${Date.now()}@test.com`;
  const memRes = await api.post('/members', {
    fullName: 'QR Admin Test Member', email, phone: '0000000000', gender: 'male', joiningDate: new Date()
  }, { headers: adminHeaders });
  
  console.log("Created Fresh Member:", memRes.status === 201 ? "SUCCESS" : "FAIL");
  
  let testUser = await User.findOne({ email });
  testUser.password = 'password123';
  await testUser.save();
  
  const memLogin = await api.post('/member-auth/login', { email, password: 'password123' });
  const memHeaders = { Authorization: `Bearer ${memLogin.data.token}` };
  
  const qrRes = await api.get('/member/qr-code', { headers: memHeaders });
  const qrString = qrRes.data.qrData;
  console.log("Generated QR String:", qrString);
  
  // Test Invalid QR (Tampered)
  console.log("\n--- Testing Tampered QR ---");
  const tamperedQrRes = await api.post('/attendance/scan', { qrData: qrString + "tamper" }, { headers: adminHeaders });
  console.log("Tampered QR Status:", tamperedQrRes.status);
  console.log("Tampered QR Response:", tamperedQrRes.data);

  // Test Valid QR
  console.log("\n--- Testing Valid QR ---");
  const validQrRes = await api.post('/attendance/scan', { qrData: qrString }, { headers: adminHeaders });
  console.log("Valid QR Status:", validQrRes.status);
  console.log("Valid QR Response:", validQrRes.data);

  // Test Duplicate QR (Scanning again immediately)
  console.log("\n--- Testing Duplicate Scan ---");
  const duplicateQrRes = await api.post('/attendance/scan', { qrData: qrString }, { headers: adminHeaders });
  console.log("Duplicate QR Status:", duplicateQrRes.status);
  console.log("Duplicate QR Response:", duplicateQrRes.data);

  // Verify in MongoDB
  const { default: Attendance } = await import('./models/Attendance.js');
  const testMember = await import('./models/Member.js');
  const m = await testMember.default.findOne({ email });
  const records = await Attendance.find({ memberId: m._id });
  console.log("\n--- MongoDB Verification ---");
  console.log("Number of Attendance records found:", records.length);
  
  process.exit(0);
}

runTest().catch(console.error);
