import Workout from '../models/Workout.js';
import Member from '../models/Member.js';
import { sendWorkoutAssignment } from '../lib/email.js';
import { sendWhatsAppWorkoutAssignment } from '../lib/whatsapp.js';

export const getWorkouts = async (req, res) => {
  try {
    const { status, difficulty, assignedMemberId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;
    if (assignedMemberId) query.assignedMemberId = assignedMemberId;

    const workouts = await Workout.find(query)
      .populate('trainerId', 'fullName specialization')
      .populate('assignedMemberId', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('trainerId', 'fullName specialization')
      .populate('assignedMemberId', 'fullName email');
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create(req.body);
    const populated = await Workout.findById(workout._id)
      .populate('trainerId', 'fullName specialization')
      .populate('assignedMemberId', 'fullName email');
    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        message: 'Validation failed: ' + messages.join(', '),
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {}),
      });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('trainerId', 'fullName specialization')
      .populate('assignedMemberId', 'fullName email');
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignToMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { assignedMemberId: memberId, progress: 'not_started' },
      { new: true, runValidators: true }
    )
      .populate('trainerId', 'fullName specialization')
      .populate('assignedMemberId', 'fullName email');
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    // Send workout assignment via email and WhatsApp (non-blocking, logged)
    if (memberId && workout.assignedMemberId) {
      sendWorkoutAssignment(workout.assignedMemberId, workout).catch(err => console.error('[Email] Workout assignment failed:', err.message));
      sendWhatsAppWorkoutAssignment(workout.assignedMemberId, workout).catch(err => console.error('[WhatsApp] Workout assignment failed:', err.message));
      
      // Create in-app notification
      import('../models/Notification.js').then(({ default: Notification }) => {
        Notification.create({
          userId: workout.assignedMemberId._id,
          title: 'New Workout Assigned!',
          message: `A new workout plan "${workout.title}" has been assigned to you.`,
          type: 'Workout',
          link: '/member/workouts'
        }).catch(err => console.error('Failed to create in-app notification:', err.message));
      });
    }
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { progress },
      { new: true, runValidators: true }
    )
      .populate('trainerId', 'fullName specialization')
      .populate('assignedMemberId', 'fullName email');
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
