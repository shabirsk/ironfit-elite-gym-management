import Lead from '../models/Lead.js';
import User from '../models/User.js';
import ContactMessage from '../models/ContactMessage.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Trainer from '../models/Trainer.js';
import Attendance from '../models/Attendance.js';
import Workout from '../models/Workout.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import AutomationLog from '../models/AutomationLog.js';

export const getAutomationLogs = async (req, res) => {
  try {
    const { category } = req.query;
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const query = {};
    if (category && category !== 'all') query.category = category;
    
    const total = await AutomationLog.countDocuments(query);
    const logs = await AutomationLog.find(query)
      .sort({ triggeredAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    
    // Get summary counts by category
    const summary = await AutomationLog.aggregate([
      { $group: { _id: { category: '$category', status: '$status' }, count: { $sum: 1 } } },
      { $sort: { '_id.category': 1 } }
    ]);
    
    res.json({ logs, total, page: pageNum, totalPages: Math.ceil(total / limitNum), summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const runAutomation = async (req, res) => {
  try {
    const { name } = req.params;
    const automations = {
      'expiry-report': (await import('../jobs/automations.js')).runExpiryReport,
      'follow-up-reminder': (await import('../jobs/automations.js')).runFollowUpReminder,
      'trial-reminder': (await import('../jobs/automations.js')).runTrialReminder,
      'daily-summary': (await import('../jobs/automations.js')).runDailyAttendanceSummary,
      'weekly-summary': (await import('../jobs/automations.js')).runWeeklyAttendanceSummary,
      'monthly-summary': (await import('../jobs/automations.js')).runMonthlyAttendanceSummary,
      'due-reminder': (await import('../jobs/automations.js')).runDueReminder,
      'receipt-trigger': (await import('../jobs/automations.js')).runReceiptTrigger,
      'daily-revenue': (await import('../jobs/automations.js')).runDailyRevenueSummary,
      'weekly-revenue': (await import('../jobs/automations.js')).runWeeklyRevenueSummary,
      'monthly-revenue': (await import('../jobs/automations.js')).runMonthlyRevenueSummary,
      'health-check': (await import('../jobs/automations.js')).runHealthCheck,
      'cleanup': (await import('../jobs/automations.js')).runCleanup,
      'expiry-check': (await import('../jobs/expiryCheck.js')).runExpiryCheck,
    };
    const fn = automations[name];
    if (!fn) {
      return res.status(404).json({ message: 'Automation "' + name + '" not found. Available: ' + Object.keys(automations).join(', ') });
    }
    const start = Date.now();
    await fn();
    const duration = Date.now() - start;
    res.json({ message: 'Automation "' + name + '" completed', duration: duration + 'ms' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/admin/test-email
 * Send a test email to verify SMTP configuration.
 * Body: { to } — optional recipient, defaults to adminEmail
 */
export const sendTestEmail = async (req, res) => {
  try {
    const { to } = req.body;
    const recipient = to || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!recipient) {
      return res.status(400).json({ message: 'No recipient specified and ADMIN_EMAIL not configured' });
    }
    
    const { sendEmail } = await import('../lib/email.js');
    const result = await sendEmail({
      to: recipient,
      subject: 'IronFit Elite — SMTP Test Email',
      html: '<!DOCTYPE html><html><head><meta charset="utf-8"></head>'
        + '<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,sans-serif;">'
        + '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">'
        + '<tr><td style="padding:40px 24px 20px;text-align:center;background:linear-gradient(135deg,#1a1a1a,#0d0d0d);border-bottom:3px solid #ff6200;">'
        + '<h1 style="color:#fff;font-size:28px;margin:0;font-weight:800;">IRONFIT <span style="color:#ff6200;">ELITE</span></h1>'
        + '<p style="color:#888;font-size:13px;">Premium Fitness Training</p></td></tr>'
        + '<tr><td style="padding:32px 24px;background:#111;">'
        + '<h2 style="color:#fff;font-size:20px;margin:0 0 16px;">SMTP Configuration Test</h2>'
        + '<p style="color:#22c55e;font-size:16px;">✅ Email delivery verified successfully!</p>'
        + '<p style="color:#ccc;font-size:14px;line-height:1.6;">This email confirms that the IronFit Elite SMTP configuration is working correctly.</p>'
        + '<table style="margin:20px 0;">'
        + '<tr><td style="color:#888;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;width:120px;">Server</td>'
        + '<td style="color:#fff;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;">' + (process.env.SMTP_HOST || 'unknown') + '</td></tr>'
        + '<tr><td style="color:#888;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;width:120px;">Recipient</td>'
        + '<td style="color:#fff;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;">' + recipient + '</td></tr>'
        + '<tr><td style="color:#888;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;width:120px;">Time</td>'
        + '<td style="color:#fff;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;">' + new Date().toLocaleString() + '</td></tr>'
        + '</table>'
        + '<p style="color:#888;font-size:13px;">All email notifications are now operational.<br><strong style="color:#fff;">Team IronFit Elite</strong></p>'
        + '</td></tr>'
        + '<tr><td style="padding:24px;text-align:center;background:#0a0a0a;">'
        + '<p style="color:#555;font-size:12px;margin:0;">IronFit Elite - Bangalore, India</p></td></tr>'
        + '</table></body></html>',
    });
    
    if (result.success) {
      res.json({ message: 'Test email sent successfully', messageId: result.messageId, to: recipient });
    } else {
      res.status(500).json({ message: 'Failed to send test email', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalLeads,
      newLeadsToday,
      leadStatusCounts,
      totalMessages,
      unreadMessages,
      totalAdmins,
      totalMembers,
      activeMembers,
      expiredMembers,
      allMembers,
      allPlans,
      totalTrainers,
      todayAttendance,
      monthlyAttendanceRecords,
      activeWorkouts,
      // Phase 4 metrics
      totalRevenueResult,
      monthlyPayments,
      pendingRenewalsCount,
      expiredSubscriptionsCount,
      activeSubscriptionsCount,
      todayPayments,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: todayStart } }),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ isRead: false }),
      User.countDocuments({ role: 'admin' }),
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
      Member.countDocuments({ status: 'expired' }),
      Member.find().populate('planId', 'price').lean(),
      Plan.find({ status: 'active' }).lean(),
      Trainer.countDocuments({ status: 'active' }),
      Attendance.countDocuments({ date: { $gte: todayStart, $lt: todayEnd } }),
      Attendance.find({ date: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
      Workout.countDocuments({ status: 'active' }),
      // Phase 4
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: 'completed',
            paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Subscription.countDocuments({
        status: 'active',
        endDate: { $gte: now, $lte: in7Days },
      }),
      Subscription.countDocuments({ status: 'expired' }),
      Subscription.countDocuments({ status: 'active' }),
      Payment.find({
        status: 'completed',
        paymentDate: { $gte: todayStart, $lt: todayEnd },
      }).lean(),
    ]);

    // Calculate monthly revenue from members (Phase 2 method, kept for backward compat)
    let estimatedMonthlyRevenue = 0;
    for (const member of allMembers) {
      if (member.planId && member.status === 'active') {
        const plan = allPlans.find(p => p._id.toString() === member.planId._id.toString());
        if (plan && plan.duration) {
          estimatedMonthlyRevenue += plan.price / (plan.duration / 30);
        }
      }
    }

    // Calculate actual monthly revenue from payments
    const actualMonthlyRevenue = monthlyPayments.length > 0 ? monthlyPayments[0].total : 0;

    // Calculate monthly attendance percentage
    const uniqueMembersThisMonth = new Set();
    for (const r of monthlyAttendanceRecords) {
      const id = r.memberId?.toString();
      if (id) uniqueMembersThisMonth.add(id);
    }
    const monthlyAttendancePct = uniqueMembersThisMonth.size > 0 && daysInMonth > 0
      ? Math.round((monthlyAttendanceRecords.length / (uniqueMembersThisMonth.size * daysInMonth)) * 100)
      : 0;

    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    const todayCollections = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    const leadsByStatus = leadStatusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const recentLeads = await Lead.find()
      .populate('assignedTo', 'fullName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalLeads,
        newLeadsToday,
        leadsByStatus,
        unreadMessages,
        totalMessages,
        totalAdmins,
        totalMembers,
        activeMembers,
        expiredMembers,
        monthlyRevenue: Math.round(actualMonthlyRevenue * 100) / 100,
        estimatedMonthlyRevenue: Math.round(estimatedMonthlyRevenue * 100) / 100,
        totalTrainers,
        todayAttendance,
        monthlyAttendancePct,
        activeWorkouts,
        // Phase 4
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        actualMonthlyRevenue: Math.round(actualMonthlyRevenue * 100) / 100,
        pendingRenewals: pendingRenewalsCount,
        expiredSubscriptions: expiredSubscriptionsCount,
        activeSubscriptions: activeSubscriptionsCount,
        todayCollections: Math.round(todayCollections * 100) / 100,
      },
      recentLeads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
