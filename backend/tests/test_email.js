import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Member from './models/Member.js';
import User from './models/User.js';

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const membersWithoutUser = await Member.find({ userId: null });
  console.log(`Found ${membersWithoutUser.length} members without userId`);

  for (const m of membersWithoutUser) {
    let user = await User.findOne({ email: m.email });
    if (!user) {
      console.log(`Creating user for ${m.email}`);
      user = await User.create({
        email: m.email,
        password: `TempPass@${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: m.fullName,
        phone: m.phone || '',
        role: 'member'
      });
    }
    m.userId = user._id;
    await m.save();
    console.log(`Linked member ${m.email} to User ${user._id}`);
  }
  
  console.log('Fix complete.');
  await mongoose.disconnect();
}
fix().catch(console.error);
