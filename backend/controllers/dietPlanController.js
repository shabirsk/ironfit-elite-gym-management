import DietPlan from '../models/DietPlan.js';
import Member from '../models/Member.js';

export const getDietPlans = async (req, res) => {
  try {
    const { status, assignedMemberId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (assignedMemberId) query.assignedMemberId = assignedMemberId;

    const dietPlans = await DietPlan.find(query)
      .populate('assignedMemberId', 'fullName email')
      .populate('trainerId', 'fullName specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await DietPlan.countDocuments(query);
    res.json({ dietPlans, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id)
      .populate('assignedMemberId', 'fullName email phone')
      .populate('trainerId', 'fullName specialization');
    if (!dietPlan) return res.status(404).json({ message: 'Diet plan not found' });
    res.json(dietPlan);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: error.message });
  }
};

export const createDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.create(req.body);
    const populated = await DietPlan.findById(dietPlan._id)
      .populate('assignedMemberId', 'fullName email')
      .populate('trainerId', 'fullName specialization');
    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedMemberId', 'fullName email')
      .populate('trainerId', 'fullName specialization');
    if (!dietPlan) return res.status(404).json({ message: 'Diet plan not found' });
    res.json(dietPlan);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findByIdAndDelete(req.params.id);
    if (!dietPlan) return res.status(404).json({ message: 'Diet plan not found' });
    res.json({ message: 'Diet plan deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
