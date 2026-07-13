import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from './config/env.js';

import User from './models/User.js';
import Plan from './models/Plan.js';
import Trainer from './models/Trainer.js';
import Member from './models/Member.js';
import Subscription from './models/Subscription.js';
import Attendance from './models/Attendance.js';
import Payment from './models/Payment.js';
import Program from './models/Program.js';

const seed = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Promise.all([
      Plan.deleteMany({}),
      Trainer.deleteMany({}),
      Member.deleteMany({}),
      Subscription.deleteMany({}),
      Attendance.deleteMany({}),
      Payment.deleteMany({}),
      Program.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      email: 'admin@ironfit.com',
      password: 'admin123',
      fullName: 'Admin',
      role: 'admin',
      isActive: true,
    });
    console.log('Created admin user: admin@ironfit.com / admin123');

    const plans = await Plan.insertMany([
      { planName: 'Basic Monthly', price: 49.99, duration: 30, features: ['Gym Access 6AM-10PM', 'Locker Room Access', 'Free Wi-Fi', '1 Free Personal Training Session'], status: 'active' },
      { planName: 'Premium Quarterly', price: 119.99, duration: 90, features: ['24/7 Gym Access', 'Locker Room + Towel Service', 'Free Wi-Fi', '4 Personal Training Sessions', 'Nutrition Consultation', 'Guest Pass (2/mo)'], status: 'active' },
      { planName: 'Elite Annual', price: 399.99, duration: 365, features: ['24/7 Gym Access', 'Premium Locker + Towel Service', 'Free Wi-Fi', 'Unlimited Personal Training', 'Monthly Nutrition Consultation', 'Unlimited Guest Passes', 'Sauna & Steam Room Access', 'Priority Class Booking'], status: 'active' },
    ]);
    console.log('Created ' + plans.length + ' plans');

    const trainers = await Trainer.insertMany([
      { fullName: 'Marcus Johnson', email: 'marcus@ironfit.com', phone: '(555) 101-2001', specialization: 'Strength & Conditioning', experienceYears: 8, certifications: ['NASM-CPT', 'CSCS', 'CrossFit Level 2'], status: 'active' },
      { fullName: 'Sofia Ramirez', email: 'sofia@ironfit.com', phone: '(555) 101-2002', specialization: 'Yoga & Flexibility', experienceYears: 6, certifications: ['RYT-500', 'Yoga Alliance E-RYT', 'ACE-CPT'], status: 'active' },
      { fullName: 'James Chen', email: 'james@ironfit.com', phone: '(555) 101-2003', specialization: 'Martial Arts & HIIT', experienceYears: 10, certifications: ['ACE-CPT', 'Krav Maga Instructor', 'NASM-PES'], status: 'active' },
      { fullName: 'Olivia Thompson', email: 'olivia@ironfit.com', phone: '(555) 101-2004', specialization: 'Nutrition & Weight Loss', experienceYears: 5, certifications: ['ISSN-SNS', 'NASM-CPT', 'Precision Nutrition Level 1'], status: 'active' },
      { fullName: 'Derek Williams', email: 'derek@ironfit.com', phone: '(555) 101-2005', specialization: 'Rehabilitation & Mobility', experienceYears: 12, certifications: ['DPT', 'NASM-CES', 'FMS Level 2'], status: 'active' },
    ]);
    console.log('Created ' + trainers.length + ' trainers');

    const memberData = [
      { fn: 'Alice Johnson', em: 'alice.j@email.com', ph: '(555) 201-1001', g: 'female', ad: '123 Oak St, Springfield' },
      { fn: 'Bob Smith', em: 'bob.smith@email.com', ph: '(555) 201-1002', g: 'male', ad: '456 Maple Ave, Springfield' },
      { fn: 'Carol White', em: 'carol.w@email.com', ph: '(555) 201-1003', g: 'female', ad: '789 Pine Rd, Springfield' },
      { fn: 'David Brown', em: 'david.b@email.com', ph: '(555) 201-1004', g: 'male', ad: '321 Elm St, Springfield' },
      { fn: 'Emily Davis', em: 'emily.d@email.com', ph: '(555) 201-1005', g: 'female', ad: '654 Cedar Ln, Springfield' },
      { fn: 'Frank Miller', em: 'frank.m@email.com', ph: '(555) 201-1006', g: 'male', ad: '987 Birch Dr, Springfield' },
      { fn: 'Grace Lee', em: 'grace.lee@email.com', ph: '(555) 201-1007', g: 'female', ad: '147 Walnut Ct, Springfield' },
      { fn: 'Henry Wilson', em: 'henry.w@email.com', ph: '(555) 201-1008', g: 'male', ad: '258 Spruce Way, Springfield' },
      { fn: 'Ivy Martinez', em: 'ivy.m@email.com', ph: '(555) 201-1009', g: 'female', ad: '369 Ash Blvd, Springfield' },
      { fn: 'Jack Taylor', em: 'jack.t@email.com', ph: '(555) 201-1010', g: 'male', ad: '159 Hickory St, Springfield' },
      { fn: 'Karen Anderson', em: 'karen.a@email.com', ph: '(555) 201-1011', g: 'female', ad: '753 Poplar Ave, Springfield' },
      { fn: 'Leo Thomas', em: 'leo.t@email.com', ph: '(555) 201-1012', g: 'male', ad: '951 Sycamore Dr, Springfield' },
      { fn: 'Mia Jackson', em: 'mia.j@email.com', ph: '(555) 201-1013', g: 'female', ad: '486 Redwood Ct, Springfield' },
      { fn: 'Noah Harris', em: 'noah.h@email.com', ph: '(555) 201-1014', g: 'male', ad: '237 Magnolia Ln, Springfield' },
      { fn: 'Olivia Clark', em: 'olivia.c@email.com', ph: '(555) 201-1015', g: 'female', ad: '864 Juniper Way, Springfield' },
      { fn: 'Peter Lewis', em: 'peter.l@email.com', ph: '(555) 201-1016', g: 'male', ad: '573 Willow Rd, Springfield' },
      { fn: 'Quinn Walker', em: 'quinn.w@email.com', ph: '(555) 201-1017', g: 'other', ad: '192 Aspen St, Springfield' },
      { fn: 'Rachel Hall', em: 'rachel.h@email.com', ph: '(555) 201-1018', g: 'female', ad: '684 Fir Blvd, Springfield' },
      { fn: 'Sam Young', em: 'sam.y@email.com', ph: '(555) 201-1019', g: 'male', ad: '371 Cypress Ave, Springfield' },
      { fn: 'Tina King', em: 'tina.k@email.com', ph: '(555) 201-1020', g: 'female', ad: '538 Laurel Dr, Springfield' },
    ];

    const members = [];
    for (let i = 0; i < memberData.length; i++) {
      const m = memberData[i];
      const jd = new Date();
      jd.setDate(jd.getDate() - Math.floor(Math.random() * 180));
      const member = await Member.create({
        fullName: m.fn, email: m.em, phone: m.ph, address: m.ad, gender: m.g,
        joinDate: jd,
        planId: plans[i % plans.length]._id,
        trainerId: trainers[i % trainers.length]._id,
        status: i < 16 ? 'active' : (i < 18 ? 'expired' : 'cancelled'),
      });
      members.push(member);
    }
    console.log('Created ' + members.length + ' members');

    const subscriptions = [];
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const plan = plans[i % plans.length];
      const sd = member.joinDate;
      const ed = new Date(sd);
      ed.setDate(ed.getDate() + plan.duration);
      const isActive = member.status === 'active';
      const sub = await Subscription.create({
        memberId: member._id, planId: plan._id,
        startDate: sd,
        endDate: isActive ? ed : new Date(ed.getTime() - Math.random() * 30 * 86400000),
        status: isActive ? 'active' : (i < 18 ? 'expired' : 'cancelled'),
        autoRenew: i < 5,
      });
      subscriptions.push(sub);
    }
    console.log('Created ' + subscriptions.length + ' subscriptions');

    const statuses = ['present', 'present', 'present', 'present', 'late', 'absent'];
    const attendanceRecords = [];
    const now = new Date();
    const used = new Set();
    let attempts = 0;
    while (attendanceRecords.length < 50 && attempts < 200) {
      attempts++;
      const mi = Math.floor(Math.random() * 16);
      const member = members[mi];
      if (!member) continue;
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(0, 0, 0, 0);
      const key = member._id.toString() + '_' + date.getTime();
      if (used.has(key)) continue;
      used.add(key);
      const st = statuses[Math.floor(Math.random() * statuses.length)];
      const ch = 5 + Math.floor(Math.random() * 12);
      const cm = Math.floor(Math.random() * 60);
      attendanceRecords.push({
        memberId: member._id, date, checkInTime: ch + ':' + String(cm).padStart(2,'0'), status: st,
      });
    }
    if (attendanceRecords.length > 0) {
      // Use insertMany with ordered:false to skip individual dupes
      try { await Attendance.insertMany(attendanceRecords, { ordered: false }); }
      catch(e) { /* ignore individual dupes */ }
    }
    console.log('Created ' + attendanceRecords.length + ' attendance records');

    const payMethods = ['cash', 'card', 'cash', 'card', 'bank_transfer', 'online'];
    const payStatuses = ['completed', 'completed', 'completed', 'completed', 'pending'];
    for (let i = 0; i < 20; i++) {
      const member = members[Math.floor(Math.random() * members.length)];
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const sub = subscriptions.find(s => s.memberId.toString() === member._id.toString());

      const pd = new Date(now);
      pd.setDate(pd.getDate() - Math.floor(Math.random() * 60));
      await Payment.create({
        memberId: member._id,
        subscriptionId: sub ? sub._id : null,
        amount: Math.round(Math.random() * 200 * 100) / 100,
        paymentMethod: payMethods[Math.floor(Math.random() * payMethods.length)],
        paymentDate: pd,
        transactionId: "TXN-" + String(i + 1).padStart(6, "0"),
        status: payStatuses[Math.floor(Math.random() * payStatuses.length)],
        notes: "",
      });
    }
    console.log("Created 20 payments");

    // Seed Programs (for public website)
    const programs = await Program.insertMany([
      {
        title: 'Strength Training',
        description: 'Build muscle and endurance with advanced equipment and coaching.',
        image: 'https://imgs.search.brave.com/e9NRpVMx8cIJWz1qiBixsPkNM7vUaqhnd15cr1JJkFw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMwMS5ueXQuY29t/L2ltYWdlcy8yMDIy/LzEwLzA0L3dlbGwv/U1RSRU5HVEgtVFJB/SU5JTkctQkVHSU5O/RVJTOC9TVFJFTkdU/SC1UUkFJTklORy1C/RUdJTk5FUlM4LWFy/dGljbGVMYXJnZS5q/cGc_cXVhbGl0eT03/NSZhdXRvPXdlYnAm/ZGlzYWJsZT11cHNj/YWxl',
        category: 'strength',
        status: 'active',
        sortOrder: 1,
      },
      {
        title: 'Yoga & Flexibility',
        description: 'Calm your mind and stretch your limits through guided yoga sessions.',
        image: 'https://imgs.search.brave.com/N3UqXoBYHwBiinsGQjJ1qebtHXmjj4NTOETPOUCcoxk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi95b3Vu/Zy1hdHRyYWN0aXZl/LXdvbWFuLXByYWN0/aWNpbmcteW9nYS1k/b2luZy1zaWRlLWNy/YW5lLXBvc2UtZGFy/ay1yb29tLXBhcnN2/YS1iYWthc2FuYS1l/eGVyY2lzZS1iYWxh/bmNlLXJlY3JlYXRp/b24tY29uY2VwdC0x/NjA0NzA2ODcuanBn',
        category: 'yoga',
        status: 'active',
        sortOrder: 2,
      },
      {
        title: 'Nutrition Plans',
        description: 'Get personalized meal plans to fuel your transformation.',
        image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
        category: 'nutrition',
        status: 'active',
        sortOrder: 3,
      },
    ]);
    console.log('Created ' + programs.length + ' programs');

    console.log("");
    console.log("Seed complete!");
    console.log("Plans: " + plans.length);
    console.log("Trainers: " + trainers.length);
    console.log("Members: " + members.length);
    console.log("Subscriptions: " + subscriptions.length);
    console.log("Attendance: " + attendanceRecords.length);
    console.log("Payments: 20");
    console.log("Programs: " + programs.length);
    console.log("");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
