import Trainer from '../models/Trainer.js';
import Member from '../models/Member.js';
import { sendTrainerAssignment } from '../lib/email.js';
import { sendWhatsAppTrainerAssignment } from '../lib/whatsapp.js';

export const getTrainers = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const trainers = await Trainer.find(query)
      .populate('assignedMembers', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('assignedMembers', 'fullName email phone');
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTrainer = async (req, res) => {
  try {
    const existingTrainer = await Trainer.findOne({ email: req.body.email });
    if (existingTrainer) {
      return res.status(400).json({ message: 'A trainer with this email already exists.' });
    }
    const trainer = await Trainer.create(req.body);
    res.status(201).json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedMembers', 'fullName email');
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json({ message: 'Trainer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { assignedMembers: memberIds },
      { new: true, runValidators: true }
    ).populate('assignedMembers', 'fullName email');
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    // Send trainer assignment via email and WhatsApp (non-blocking, logged)
    if (memberIds && memberIds.length > 0) {
      Member.find({ _id: { $in: memberIds } }).then(members => {
        members.forEach(m => {
          sendTrainerAssignment(m, trainer).catch(err => console.error('[Email] Trainer assignment failed:', err.message));
          sendWhatsAppTrainerAssignment(m, trainer).catch(err => console.error('[WhatsApp] Trainer assignment failed:', err.message));
        });
      }).catch(err => console.error('[Member] Member lookup for trainer assignment failed:', err.message));
    }
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
