import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb+srv://SHAIKSHABIR:IronFitMongo2026@cluster0.5nqi70a.mongodb.net/ironfit-elite?retryWrites=true&w=majority&appName=Cluster0';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  profileImage: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'trainer', 'member'], default: 'member' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function main() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.\n');

    let admin = await User.findOne({ email: 'admin@ironfit.com' });

    if (admin) {
      console.log('Admin user FOUND: ' + admin.email + ' (role: ' + admin.role + ')');
      console.log('Resetting password to: admin123');
      admin.password = 'admin123';
      await admin.save();
      console.log('Password updated successfully via pre-save hook.\n');
    } else {
      console.log('Admin user NOT found. Creating new admin...');
      admin = await User.create({
        email: 'admin@ironfit.com',
        password: 'admin123',
        fullName: 'Admin',
        role: 'admin',
        isActive: true,
      });
      console.log('Admin user created successfully.\n');
    }

    const verifyUser = await User.findOne({ email: 'admin@ironfit.com' }).select('+password');
    console.log('Verification:');
    console.log('  Email:    ' + verifyUser.email);
    console.log('  Role:     ' + verifyUser.role);
    console.log('  FullName: ' + verifyUser.fullName);
    console.log('  Active:   ' + verifyUser.isActive);

    const isMatch = await verifyUser.comparePassword('admin123');
    console.log('  Password match for admin123: ' + (isMatch ? 'YES' : 'NO'));

    if (!isMatch) {
      console.log('\nPassword does NOT match! Something went wrong with hashing.');
      process.exit(1);
    }

    console.log('\nAdmin user is ready. You can now log in with:');
    console.log('   Email:    admin@ironfit.com');
    console.log('   Password: admin123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
