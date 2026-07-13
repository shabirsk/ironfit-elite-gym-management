import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'walk-in', 'social', 'other'],
    default: 'website',
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'trial_scheduled', 'converted', 'lost'],
    default: 'new',
  },
  lastContactedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  convertedMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    default: null,
  },
}, { timestamps: true });

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ email: 1 });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
