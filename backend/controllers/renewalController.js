import Subscription from '../models/Subscription.js';
import Member from '../models/Member.js';

export const getRenewalDashboard = async (req, res) => {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      expiringIn7Days,
      expiringIn30Days,
      expiredSubscriptions,
      activeSubscriptions,
    ] = await Promise.all([
      Subscription.find({
        status: 'active',
        endDate: { $gte: now, $lte: in7Days },
      })
        .populate('memberId', 'fullName email phone')
        .populate('planId', 'planName price duration')
        .sort({ endDate: 1 }),
      Subscription.find({
        status: 'active',
        endDate: { $gte: now, $lte: in30Days },
      })
        .populate('memberId', 'fullName email phone')
        .populate('planId', 'planName price duration')
        .sort({ endDate: 1 }),
      Subscription.find({ status: 'expired' })
        .populate('memberId', 'fullName email phone')
        .populate('planId', 'planName price duration')
        .sort({ endDate: -1 })
        .limit(50),
      Subscription.countDocuments({ status: 'active' }),
    ]);

    res.json({
      expiringIn7Days,
      expiringIn30Days,
      expiredSubscriptions,
      counts: {
        activeSubscriptions,
        expiringIn7Days: expiringIn7Days.length,
        expiringIn30Days: expiringIn30Days.length,
        expired: expiredSubscriptions.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
