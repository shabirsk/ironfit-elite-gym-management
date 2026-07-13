import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import generateToken from './utils/generateToken.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        fullName: 'System Admin',
        email: 'admin@system.com',
        password: 'password123',
        role: 'admin'
      });
    }
    const token = generateToken(admin._id);
    console.log(`ADMIN_TOKEN=${token}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
