import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member is required'],
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

subscriptionSchema.index({ memberId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
