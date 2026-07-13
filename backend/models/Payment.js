import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member is required'],
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: null,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online', 'other'],
    default: 'cash',
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now,
  },
  transactionId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed', 'refunded'],
    default: 'completed',
  },
  notes: {
    type: String,
    default: '',
  },
  // Razorpay-specific fields
  razorpayOrderId: {
    type: String,
    default: '',
  },
  razorpayPaymentId: {
    type: String,
    default: '',
  },
  razorpaySignature: {
    type: String,
    default: '',
  },
  paymentType: {
    type: String,
    enum: ['manual', 'online'],
    default: 'manual',
  },
}, { timestamps: true });

paymentSchema.index({ memberId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ status: 1, paymentDate: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
