import crypto from 'crypto';
import Member from '../models/Member.js';
import Subscription from '../models/Subscription.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';
import Workout from '../models/Workout.js';
import DietPlan from '../models/DietPlan.js';
import Notification from '../models/Notification.js';
import Trainer from '../models/Trainer.js';
import User from '../models/User.js';
import env from '../config/env.js';

const QR_SECRET = env.jwtSecret || 'ironfit-qr-secret';

export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const member = await Member.findOne({ email: user.email })
      .populate('planId', 'planName price duration features')
      .populate('trainerId', 'fullName email phone specialization profileImage');

    if (!member) return res.status(404).json({ message: 'Member profile not found' });

    const subscription = await Subscription.findOne({ memberId: member._id, status: 'active' })
      .populate('planId', 'planName price duration features');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      memberId: member._id,
      date: { $gte: monthStart, $lte: monthEnd },
    }).sort({ date: -1 });

    const totalAttendance = attendanceRecords.length;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const attendancePercentage = daysInMonth > 0 ? Math.round((totalAttendance / daysInMonth) * 100) : 0;

    const recentPayments = await Payment.find({ memberId: member._id })
      .sort({ paymentDate: -1 })
      .limit(6);

    const workouts = await Workout.find({ assignedMemberId: member._id, status: 'active' })
      .sort({ createdAt: -1 });

    const dietPlans = await DietPlan.find({ assignedMemberId: member._id, status: 'active' })
      .sort({ createdAt: -1 });

    const unreadNotifications = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({
      member: {
        id: member._id,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone || '',
        profileImage: member.profileImage || '',
        status: member.status,
        joinDate: member.joinDate,
        planId: member.planId,
        trainerId: member.trainerId,
        createdAt: member.createdAt,
      },
      subscription: subscription ? {
        id: subscription._id,
        planName: subscription.planId?.planName || 'N/A',
        price: subscription.planId?.price || 0,
        duration: subscription.planId?.duration || 0,
        features: subscription.planId?.features || [],
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
        autoRenew: subscription.autoRenew,
        daysRemaining: Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
      } : null,
      attendance: {
        totalThisMonth: totalAttendance,
        daysInMonth,
        percentage: attendancePercentage,
        records: attendanceRecords.slice(0, 10),
      },
      recentPayments: recentPayments.map(p => ({
        id: p._id,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate,
        status: p.status,
        transactionId: p.transactionId || '',
      })),
      workouts: workouts.map(w => ({
        id: w._id,
        title: w.title,
        difficulty: w.difficulty,
        durationWeeks: w.durationWeeks,
        exercises: w.exercises,
        progress: w.progress,
      })),
      dietPlans: dietPlans.map(d => ({
        id: d._id,
        title: d.title,
        goal: d.goal,
        dailyCalories: d.dailyCalories,
        meals: d.meals,
        startDate: d.startDate,
        endDate: d.endDate,
      })),
      unreadNotifications,
    });
  } catch (error) {
    console.error('[MemberDashboard] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const member = await Member.findOne({ email: user.email });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const { month, year, page = 1, limit = 30 } = req.query;
    const now = new Date();
    const queryMonth = month || now.getMonth() + 1;
    const queryYear = year || now.getFullYear();

    const startDate = new Date(queryYear, queryMonth - 1, 1);
    const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59, 999);

    const records = await Attendance.find({
      memberId: member._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 }).skip((page - 1) * limit).limit(Number(limit));

    const total = await Attendance.countDocuments({ memberId: member._id, date: { $gte: startDate, $lte: endDate } });
    const totalPresent = records.filter(r => r.status === 'present').length;
    const totalLate = records.filter(r => r.status === 'late').length;
    const totalAbsent = records.filter(r => r.status === 'absent').length;
    const daysInMonth = new Date(queryYear, queryMonth, 0).getDate();

    res.json({
      records, total, page: Number(page),
      totalPresent, totalLate, totalAbsent,
      daysInMonth,
      percentage: daysInMonth > 0 ? Math.round((totalPresent / daysInMonth) * 100) : 0,
      month: Number(queryMonth), year: Number(queryYear),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const member = await Member.findOne({ email: user.email });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const { page = 1, limit = 20 } = req.query;
    const payments = await Payment.find({ memberId: member._id })
      .sort({ paymentDate: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Payment.countDocuments({ memberId: member._id });
    const totalSpent = await Payment.aggregate([
      { $match: { memberId: member._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({ payments, total, page: Number(page), totalSpent: totalSpent[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySubscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const member = await Member.findOne({ email: user.email });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const subscriptions = await Subscription.find({ memberId: member._id })
      .populate('planId', 'planName price duration features')
      .sort({ createdAt: -1 });

    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyWorkouts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const member = await Member.findOne({ email: user.email });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const workouts = await Workout.find({ assignedMemberId: member._id })
      .populate('trainerId', 'fullName specialization')
      .sort({ createdAt: -1 });

    res.json({ workouts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkoutProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const validProgress = ['not_started', 'in_progress', 'completed'];
    if (!validProgress.includes(progress)) {
      return res.status(400).json({ message: 'Invalid progress value' });
    }
    const workout = await Workout.findByIdAndUpdate(req.params.id, { progress }, { new: true, runValidators: true });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDietPlans = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const member = await Member.findOne({ email: user.email });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const dietPlans = await DietPlan.find({ assignedMemberId: member._id })
      .populate('trainerId', 'fullName specialization')
      .sort({ createdAt: -1 });

    res.json({ dietPlans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTrainer = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const member = await Member.findOne({ email: user.email });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (!member.trainerId) {
      return res.json({ trainer: null, message: 'No trainer assigned yet' });
    }
    const trainer = await Trainer.findById(member.trainerId)
      .select('fullName email phone specialization experienceYears certifications profileImage');
    res.json({ trainer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateQRCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const member = await Member.findOne({ email: user.email });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const signature = crypto.createHmac('sha256', QR_SECRET).update(member._id.toString()).digest('hex');
    const qrData = member._id.toString() + ':' + signature;

    res.json({
      qrData,
      memberId: member._id,
      memberName: member.fullName,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData || typeof qrData !== 'string') {
      return res.status(400).json({ message: 'Invalid QR data' });
    }

    const cleanQrData = qrData.trim();
    const colonIndex = cleanQrData.indexOf(':');
    if (colonIndex === -1) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const memberId = cleanQrData.substring(0, colonIndex).trim();
    const signature = cleanQrData.substring(colonIndex + 1).trim();

    const expectedSig = crypto.createHmac('sha256', QR_SECRET).update(memberId).digest('hex');

    if (signature !== expectedSig) {
      return res.status(400).json({ message: 'Invalid QR code signature' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const existing = await Attendance.findOne({
      memberId: member._id,
      date: { $gte: todayStart, $lt: todayEnd },
    });

    if (existing) {
      return res.status(400).json({
        message: 'Attendance already marked for today',
        existingRecord: existing,
      });
    }

    const record = await Attendance.create({
      memberId: member._id,
      date: new Date(),
      checkInTime: new Date().toLocaleTimeString(),
      status: 'present',
    });

    res.status(201).json({
      message: 'Attendance marked successfully',
      record,
      member: { id: member._id, fullName: member.fullName },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
