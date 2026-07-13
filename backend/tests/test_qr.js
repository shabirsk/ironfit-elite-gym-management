import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  validateStatus: () => true
});

async function runTest() {
  console.log("Starting QR Code Test...");
  await mongoose.connect('mongodb://127.0.0.1:27017/ironfit-elite');
  
  // 1. Admin Login
  let admin = await User.findOne({ email: 'admin@test.com' });
  admin.password = 'password123';
  await admin.save();
  const adminRes = await api.post('/auth/login', { email: 'admin@test.com', password: 'password123' });
  const adminHeaders = { Authorization: `Bearer ${adminRes.data.token}` };
  
  // 2. Create a fresh Member for this test so they have NO attendance today
  const email = `qrtest_${Date.now()}@test.com`;
  const memRes = await api.post('/members', {
    fullName: 'QR Test Member', email, phone: '0000000000', gender: 'male', joiningDate: new Date()
  }, { headers: adminHeaders });
  
  console.log("Created Fresh Member:", memRes.status === 201 ? "SUCCESS" : "FAIL");
  
  // 3. Member Login
  let testUser = await User.findOne({ email });
  testUser.password = 'password123';
  await testUser.save();
  
  const memLogin = await api.post('/member-auth/login', { email, password: 'password123' });
  const memHeaders = { Authorization: `Bearer ${memLogin.data.token}` };
  
  // 4. Generate QR Code
  const qrRes = await api.get('/member/qr-code', { headers: memHeaders });
  console.log("Generate QR Status:", qrRes.status);
  
  const qrString = qrRes.data.qrData;
  console.log("Generated QR String:", qrString);
  
  // 5. Test Member Portal 'Scan QR' (Simulating pasting it into the member portal)
  const scanRes = await api.post('/member/scan-qr', { qrData: qrString }, { headers: memHeaders });
  console.log("Member Scan QR Status:", scanRes.status);
  console.log("Member Scan Response:", scanRes.data);
  
  // 6. Test Admin Scanner format parsing (simulating the QRAttendance.jsx logic)
  const parsedId = qrString.includes(':') ? qrString.split(':')[0] : qrString;
  const adminScanRes = await api.post('/attendance', {
    memberId: parsedId.trim(),
    date: new Date().toISOString(),
    status: 'present',
    checkInTime: new Date().toLocaleTimeString()
  }, { headers: adminHeaders });
  
  // Note: This might return 400 because the Member scan just marked them present!
  console.log("Admin Scan Attempt Status:", adminScanRes.status);
  console.log("Admin Scan Response:", adminScanRes.data);
  
  process.exit(0);
}

runTest().catch(console.error);
