import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true,
  },
  sets: {
    type: Number,
    default: 3,
    min: 1,
  },
  reps: {
    type: String,
    default: '12',
  },
  weight: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
}, { _id: false });

const workoutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Workout title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  durationWeeks: {
    type: Number,
    required: [true, 'Duration in weeks is required'],
    min: 1,
  },
  exercises: [exerciseSchema],
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    default: null,
  },
  assignedMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    default: null,
  },
  progress: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, { timestamps: true });

workoutSchema.index({ status: 1 });
workoutSchema.index({ assignedMemberId: 1 });

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout;
