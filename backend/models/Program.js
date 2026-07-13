import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Program title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Program description is required'],
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['strength', 'yoga', 'nutrition', 'cardio', 'hiit', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

programSchema.index({ status: 1, sortOrder: 1 });

const Program = mongoose.model('Program', programSchema);
export default Program;
