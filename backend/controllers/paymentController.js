import Payment from '../models/Payment.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import { sendPaymentReceipt } from '../lib/email.js';
import { sendWhatsAppPaymentReceipt } from '../lib/whatsapp.js';

export const getPayments = async (req, res) => {
  try {
    const { memberId, status, method, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};
    if (memberId) query.memberId = memberId;
    if (status) query.status = status;
    if (method) query.paymentMethod = method;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('memberId', 'fullName email phone')
      .populate('subscriptionId', 'startDate endDate status')
      .sort({ paymentDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);
    res.json({ payments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('memberId', 'fullName email phone')
      .populate('subscriptionId', 'startDate endDate status');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const { memberId, subscriptionId, amount, paymentMethod, paymentDate, transactionId, status, notes } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (subscriptionId) {
      const sub = await Subscription.findById(subscriptionId);
      if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    }

    const payment = await Payment.create({
      memberId,
      subscriptionId: subscriptionId === '' ? null : subscriptionId,
      amount,
      paymentMethod: paymentMethod || 'cash',
      paymentDate: paymentDate || new Date(),
      transactionId: transactionId || '',
      status: status || 'completed',
      notes: notes || '',
    });

    const populated = await Payment.findById(payment._id)
      .populate('memberId', 'fullName email phone')
      .populate('subscriptionId', 'startDate endDate status');

    // Send payment receipt via email and WhatsApp (non-blocking, logged)
    sendPaymentReceipt(member, payment, null).catch(err => console.error('[Email] Payment receipt failed:', err.message));
    sendWhatsAppPaymentReceipt(member, payment, null).catch(err => console.error('[WhatsApp] Payment receipt failed:', err.message));

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentReports = async (req, res) => {
  try {
    const { year } = req.query;
    const queryYear = year || new Date().getFullYear();

    // Revenue by month for the given year
    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'pending'] },
          paymentDate: {
            $gte: new Date(queryYear, 0, 1),
            $lte: new Date(queryYear, 11, 31, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'pending'] },
          paymentDate: {
            $gte: new Date(queryYear, 0, 1),
            $lte: new Date(queryYear, 11, 31, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Revenue by plan (via subscription lookup)
    const revenueByPlan = await Payment.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'pending'] },
          subscriptionId: { $ne: null },
          paymentDate: {
            $gte: new Date(queryYear, 0, 1),
            $lte: new Date(queryYear, 11, 31, 23, 59, 59, 999),
          },
        },
      },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'subscriptionId',
          foreignField: '_id',
          as: 'subscription',
        },
      },
      { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'plans',
          localField: 'subscription.planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$plan.planName',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Status breakdown
    const statusBreakdown = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Today's collections
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const todayPayments = await Payment.find({
      status: 'completed',
      paymentDate: { $gte: todayStart, $lt: todayEnd },
    });

    const todayCollections = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      revenueByMonth,
      revenueByMethod,
      revenueByPlan,
      statusBreakdown,
      todayCollections,
      totalRevenue: revenueByMonth.reduce((sum, m) => sum + m.total, 0),
      year: Number(queryYear),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
