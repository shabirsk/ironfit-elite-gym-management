import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  specialization: {
    type: String,
    trim: true,
  },
  experienceYears: {
    type: Number,
    default: 0,
    min: 0,
  },
  certifications: [{
    type: String,
    trim: true,
  }],
  profileImage: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  }],
}, { timestamps: true });


const Trainer = mongoose.model('Trainer', trainerSchema);
export default Trainer;
