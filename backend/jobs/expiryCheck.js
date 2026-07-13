import logger from '../utils/logger.js';
import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import AutomationLog from '../models/AutomationLog.js';
import { sendExpiryReminder } from '../lib/email.js';
import { sendWhatsAppExpiryReminder, sendWhatsAppRenewalConfirmation } from '../lib/whatsapp.js';

// Run every hour to check for expired subscriptions
cron.schedule('0 * * * *', async () => {
  await runExpiryCheck();
});

export async function runExpiryCheck() {
  const start = Date.now();
  const now = new Date();

  try {
    // Find subscriptions that have passed their endDate but are still active
    const expiredSubs = await Subscription.find({
      status: 'active',
      endDate: { $lte: now },
    });

    if (expiredSubs.length === 0) {
      await AutomationLog.create({
        category: 'membership',
        automation: 'expiry-check',
        status: 'success',
        summary: 'No expired subscriptions found',
        details: {},
        recordsAffected: 0,
        duration: Date.now() - start,
        triggeredAt: new Date(),
      });
      return;
    }

    const toAutoRenew = [];
    const toExpire = [];

    for (const sub of expiredSubs) {
      if (sub.autoRenew) {
        toAutoRenew.push(sub);
      } else {
        toExpire.push(sub);
      }
    }

    // Auto-renew subscriptions with autoRenew enabled
    if (toAutoRenew.length > 0) {
      for (const sub of toAutoRenew) {
        const plan = await Plan.findById(sub.planId);
        if (plan) {
          const newEnd = new Date(sub.endDate);
          newEnd.setDate(newEnd.getDate() + plan.duration);
          sub.endDate = newEnd;
          sub.status = 'active';
          await sub.save();
          // Ensure member stays active
          const member = await Member.findByIdAndUpdate(sub.memberId, { status: 'active' }, { new: true });
          // Send renewal confirmation via email and WhatsApp
          if (member) {
            const populatedSub = await Subscription.findById(sub._id).populate('planId', 'planName price duration');
            sendExpiryReminder(member, populatedSub || sub).catch(err => logger.error('[Email] Expiry reminder failed:', err.message));
            sendWhatsAppRenewalConfirmation(member, populatedSub || sub).catch(err => logger.error('[WhatsApp] Renewal confirmation failed:', err.message));
          }
        } else {
          // Plan was deleted — can't auto-renew, fall back to expiry
          logger.warn(`[ExpiryCheck] Plan ${sub.planId} not found for subscription ${sub._id} — expiring instead`);
          toExpire.push(sub);
        }
      }
      logger.info(`[ExpiryCheck] Auto-renewed ${toAutoRenew.filter(s => s.status === 'active').length} subscriptions`);
    }

    // Send expiry reminders for subscriptions about to expire (not yet past due)
    // NOTE: Uses the outer `now` from function scope — do NOT redeclare `const now` here (causes TDZ error)
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringSoon = await Subscription.find({
      status: 'active',
      endDate: { $gte: now, $lte: in3Days },
    }).populate('planId', 'planName price duration');
    for (const sub of expiringSoon) {
      const member = await Member.findById(sub.memberId);
      if (member) {
        sendExpiryReminder(member, sub).catch(() => {});
        sendWhatsAppExpiryReminder(member, sub).catch(() => {});
      }
    }

    // Expire subscriptions (original + autoRenew fallbacks)
    if (toExpire.length > 0) {
      const expireIds = toExpire.map(s => s._id);
      const expireMemberIds = [...new Set(toExpire.map(s => s.memberId.toString()))];

      await Subscription.updateMany(
        { _id: { $in: expireIds } },
        { $set: { status: 'expired', autoRenew: false } }
      );

      // Only expire members who have NO remaining active subscriptions
      for (const memberId of expireMemberIds) {
        const activeCount = await Subscription.countDocuments({
          memberId,
          status: 'active',
          _id: { $nin: expireIds },
        });
        if (activeCount === 0) {
          await Member.findByIdAndUpdate(memberId, { status: 'expired' });
        }
      }

      logger.info(`[ExpiryCheck] Expired ${toExpire.length} subscriptions`);
    }

    await AutomationLog.create({
      category: 'membership',
      automation: 'expiry-check',
      status: 'success',
      summary: 'Renewed ' + toAutoRenew.filter(s => s.status === 'active').length + ', expired ' + toExpire.length + ' subscriptions',
      details: { autoRenewed: toAutoRenew.filter(s => s.status === 'active').length, expired: toExpire.length },
      recordsAffected: toAutoRenew.length + toExpire.length,
      duration: Date.now() - start,
      triggeredAt: new Date(),
    });
  } catch (error) {
    logger.error('[ExpiryCheck] Error:', error.message);
    try {
      await AutomationLog.create({
        category: 'membership',
        automation: 'expiry-check',
        status: 'error',
        summary: 'Failed: ' + error.message,
        details: {},
        recordsAffected: 0,
        duration: Date.now() - start,
        error: error.message,
        triggeredAt: new Date(),
      });
    } catch (logErr) {
      logger.error('[ExpiryCheck] Failed to log:', logErr.message);
    }
  }
}

logger.info('[ExpiryCheck] Cron job registered — runs every hour');
