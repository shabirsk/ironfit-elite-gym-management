import mongoose from 'mongoose';

const automationLogSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['membership', 'lead', 'attendance', 'payment', 'revenue', 'whatsapp', 'system'],
    index: true,
  },
  automation: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'warning', 'error'],
  },
  summary: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  recordsAffected: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    default: 0,
  },
  triggeredAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  error: {
    type: String,
    default: null,
  },
});

automationLogSchema.index({ triggeredAt: -1 });
automationLogSchema.index({ category: 1, triggeredAt: -1 });

export default mongoose.model('AutomationLog', automationLogSchema);
