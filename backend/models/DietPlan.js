import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  time: { type: String, default: '' },
  foods: [{ type: String, trim: true }],
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
}, { _id: false });

const dietPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Diet plan title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_building', 'general_fitness', 'other'],
    default: 'general_fitness',
  },
  dailyCalories: {
    type: Number,
    default: 0,
  },
  meals: [mealSchema],
  assignedMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    default: null,
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    default: null,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active',
  },
}, { timestamps: true });

dietPlanSchema.index({ assignedMemberId: 1 });
dietPlanSchema.index({ trainerId: 1 });
dietPlanSchema.index({ status: 1 });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export default DietPlan;
