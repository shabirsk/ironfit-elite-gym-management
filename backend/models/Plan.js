import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration in days is required'],
    min: [1, 'Duration must be at least 1 day'],
  },
  features: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
