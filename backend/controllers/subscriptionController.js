import Subscription from '../models/Subscription.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import { sendRenewalConfirmation } from '../lib/email.js';

export const getSubscriptions = async (req, res) => {
  try {
    const { status, memberId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (memberId) query.memberId = memberId;

    const subscriptions = await Subscription.find(query)
      .populate('memberId', 'fullName email phone')
      .populate('planId', 'planName price duration')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Subscription.countDocuments(query);
    res.json({ subscriptions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id)
      .populate('memberId', 'fullName email phone')
      .populate('planId', 'planName price duration features');
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { memberId, planId, startDate, autoRenew } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Prevent duplicate active subscriptions for the same member
    const existingActive = await Subscription.findOne({ memberId, status: 'active' });
    if (existingActive) {
      return res.status(400).json({
        message: 'Member already has an active subscription. Cancel the existing one before creating a new one.',
        existingSubscriptionId: existingActive._id,
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);

    const subscription = await Subscription.create({
      memberId,
      planId,
      startDate: start,
      endDate: end,
      autoRenew: autoRenew || false,
    });

    // Update member's status and planId
    member.planId = planId;
    member.status = 'active';
    await member.save();

    const populated = await Subscription.findById(subscription._id)
      .populate('memberId', 'fullName email phone')
      .populate('planId', 'planName price duration');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renewSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id).populate('planId', 'duration');
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    if (!sub.planId) return res.status(400).json({ message: 'Associated plan not found' });

    // Extend from current endDate so member gets full duration
    const baseDate = sub.endDate > new Date() ? sub.endDate : new Date();
    const newEnd = new Date(baseDate);
    newEnd.setDate(newEnd.getDate() + sub.planId.duration);

    sub.startDate = baseDate > new Date() ? sub.startDate : new Date();
    sub.endDate = newEnd;
    sub.status = 'active';
    await sub.save();

    // Re-activate member
    await Member.findByIdAndUpdate(sub.memberId, { status: 'active' });

    const populated = await Subscription.findById(sub._id)
      .populate('memberId', 'fullName email phone')
      .populate('planId', 'planName price duration');

    // Send renewal confirmation (non-blocking, logged)
    if (populated.memberId) {
      Promise.resolve(populated.memberId).then(m => {
        sendRenewalConfirmation(m, populated).catch(err => console.error('[Email] Renewal confirmation failed:', err.message));
      });
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', autoRenew: false },
      { new: true }
    )
      .populate('memberId', 'fullName email phone')
      .populate('planId', 'planName price duration');

    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    // Mark member as cancelled too
    await Member.findByIdAndUpdate(sub.memberId, { status: 'cancelled' });

    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('memberId', 'fullName email phone')
      .populate('planId', 'planName price duration');
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json({ message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
