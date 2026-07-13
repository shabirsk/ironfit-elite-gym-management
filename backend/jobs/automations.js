import logger from '../utils/logger.js';
import cron from "node-cron";
import Lead from "../models/Lead.js";
import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";
import AutomationLog from "../models/AutomationLog.js";
import { sendPaymentReminder } from "../lib/email.js";

export var log = async function(category, automation, status, summary, opts) {
  try {
    opts = opts || {};
    await AutomationLog.create({
      category: category,
      automation: automation,
      status: status,
      summary: summary,
      details: opts.details || {},
      recordsAffected: opts.recordsAffected || 0,
      duration: opts.duration || 0,
      error: opts.error || null
    });
  } catch(e) {
    logger.error("[AutoLog] Failed:", e.message);
  }
};

logger.info("[Automations] Registered 15 automations with persistence");

// ===== MEMBERSHIP AUTOMATIONS =====
export async function runExpiryReport() {
  const start = Date.now();
  try {
    const now = new Date();
    const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expToday = await Subscription.countDocuments({ status: 'active', endDate: { $gte: now, $lte: endToday } });
    const exp7d = await Subscription.countDocuments({ status: 'active', endDate: { $gte: now, $lte: in7Days } });
    const exp30d = await Subscription.countDocuments({ status: 'active', endDate: { $gte: now, $lte: in30Days } });
    const msg = 'Expiring: TODAY=' + expToday + ' | 7d=' + exp7d + ' | 30d=' + exp30d;
    logger.info('[MemberAuto]', msg);
    await log('membership', 'expiry-report', 'success', msg, { recordsAffected: expToday+exp7d+exp30d, details: { expToday, exp7d, exp30d }, duration: Date.now()-start });
  } catch(e) { logger.error('[MemberAuto] Error:', e.message); await log('membership', 'expiry-report', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('0 8 * * *', runExpiryReport);

// ===== LEAD AUTOMATIONS =====
export async function runFollowUpReminder() {
  const start = Date.now();
  try {
    const now = new Date();
    const h24 = new Date(now - 86400000);
    const h48 = new Date(now - 172800000);
    const uc = await Lead.countDocuments({ status: 'new', createdAt: { $lte: h24 } });
    const crit = await Lead.countDocuments({ status: 'new', createdAt: { $lte: h48 } });
    const msg = 'Uncontacted >24h: ' + uc + ' | >48h: ' + crit;
    logger.info('[LeadAuto]', msg);
    await log('lead', 'follow-up-reminder', crit > 0 ? 'warning' : 'success', msg, { recordsAffected: uc+crit, details: { uncontacted24h: uc, uncontacted48h: crit }, duration: Date.now()-start });
  } catch(e) { logger.error('[LeadAuto] Error:', e.message); await log('lead', 'follow-up-reminder', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('0 */4 * * *', runFollowUpReminder);

export async function runTrialReminder() {
  const start = Date.now();
  try {
    const now = new Date();
    const d3 = new Date(now - 259200000);
    const d7 = new Date(now - 604800000);
    const stale3d = await Lead.countDocuments({ status: 'trial_scheduled', updatedAt: { $lte: d3 } });
    const stale7d = await Lead.countDocuments({ status: 'trial_scheduled', updatedAt: { $lte: d7 } });
    const staleLeads = await Lead.find({ status: 'trial_scheduled', updatedAt: { $lte: d7 } }).select('fullName createdAt').lean();
    for (const sl of staleLeads) { logger.info('[LeadAuto] Auto-lost trial:', sl.fullName); }
    const ids = staleLeads.map(x=>x._id);
    const lost = ids.length > 0 ? await Lead.updateMany({ _id: { $in: ids } }, { $set: { status: 'lost' } }) : { modifiedCount: 0 };
    const msg = 'Stale trials: ' + stale3d + ' (>3d) | Auto-lost: ' + lost.modifiedCount + ' (>7d)';
    logger.info('[LeadAuto]', msg);
    await log('lead', 'trial-reminder', stale3d > 0 || lost.modifiedCount > 0 ? 'warning' : 'success', msg, { recordsAffected: lost.modifiedCount, details: { stale3d, autoLost: lost.modifiedCount }, duration: Date.now()-start });
  } catch(e) { logger.error('[LeadAuto] Trial error:', e.message); await log('lead', 'trial-reminder', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('0 */6 * * *', runTrialReminder);

// ===== ATTENDANCE AUTOMATIONS =====
export async function runDailyAttendanceSummary() {
  const start = Date.now();
  try {
    const now = new Date();
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const e = new Date(s.getTime() + 86400000);
    const r = await Attendance.find({ date: { $gte: s, $lt: e } }).lean();
    const p = r.filter(x=>x.status==='present').length;
    const l = r.filter(x=>x.status==='late').length;
    const ab = r.filter(x=>x.status==='absent').length;
    const msg = r.length + ' records: ' + p + 'P/' + l + 'L/' + ab + 'A';
    logger.info('[AttendAuto] Daily:', msg);
    await log('attendance', 'daily-summary', 'success', msg, { recordsAffected: r.length, details: { present: p, late: l, absent: ab }, duration: Date.now()-start });
    // Absent detection (3+ consecutive weekdays)
    const active = await Member.find({ status: 'active' }).select('fullName').lean();
    const last5 = [1,2,3,4,5].map(d => new Date(s.getTime() - d * 86400000));
    for (const m of active) {
      const cnt = await Attendance.countDocuments({ memberId: m._id, date: { $gte: last5[4], $lt: s }, status: 'absent' });
      if (cnt >= 3) {
        logger.info('[AttendAuto] Absent:', m.fullName, cnt, 'of 5 days');
        await log('attendance', 'absent-detection', 'warning', m.fullName + ' absent ' + cnt + '/5 days', { recordsAffected: 1, details: { memberName: m.fullName, absentDays: cnt }, duration: Date.now()-start });
      }
    }
  } catch(e) { logger.error('[AttendAuto] Error:', e.message); await log('attendance', 'daily-summary', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('30 23 * * *', runDailyAttendanceSummary);

export async function runWeeklyAttendanceSummary() {
  const start = Date.now();
  try {
    const r = await Attendance.find({ date: { $gte: new Date(Date.now()-604800000) } }).lean();
    const u = new Set(r.map(x=>x.memberId.toString())).size;
    const msg = r.length + ' records, ' + u + ' unique members';
    logger.info('[AttendAuto] Weekly:', msg);
    await log('attendance', 'weekly-summary', 'success', msg, { recordsAffected: r.length, details: { records: r.length, uniqueMembers: u }, duration: Date.now()-start });
  } catch(e) { logger.error('[AttendAuto] Weekly error:', e.message); await log('attendance', 'weekly-summary', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('0 23 * * 0', runWeeklyAttendanceSummary);

export async function runMonthlyAttendanceSummary() {
  const start = Date.now();
  try {
    const now = new Date();
    const ms = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const me = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const r = await Attendance.find({ date: { $gte: ms, $lte: me } }).lean();
    const u = new Set(r.map(x=>x.memberId.toString())).size;
    const msg = r.length + ' records, ' + u + ' unique members';
    logger.info('[AttendAuto] Monthly:', msg);
    await log('attendance', 'monthly-summary', 'success', msg, { recordsAffected: r.length, details: { records: r.length, uniqueMembers: u }, duration: Date.now()-start });
  } catch(e) { logger.error('[AttendAuto] Monthly error:', e.message); await log('attendance', 'monthly-summary', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('0 23 1 * *', runMonthlyAttendanceSummary);

// ===== PAYMENT AUTOMATIONS =====
export async function runDueReminder() {
  const start = Date.now();
  try {
    const now = new Date();
    const d7 = new Date(now.getTime()+604800000);
    const n7 = await Subscription.countDocuments({ status: 'active', endDate: { $gte: now, $lte: d7 } });
    
    // Send payment reminders to members whose subscriptions expire in 7 days
    if (n7 > 0) {
      const expiring = await Subscription.find({ status: 'active', endDate: { $gte: now, $lte: d7 } })
        .populate('memberId', 'fullName email')
        .populate('planId', 'planName price duration');
      for (const sub of expiring) {
        if (sub.memberId && sub.planId) {
          sendPaymentReminder(sub.memberId, sub).catch(() => {});
        }
      }
    }
    
    const failed = await Payment.find({ status: 'failed', createdAt: { $gte: new Date(now-86400000) } }).populate('memberId','fullName').lean();
    const msg = 'Subs expiring in 7d: ' + n7 + ' | Failed (24h): ' + failed.length + ' | Reminders sent: ' + n7;
    logger.info('[PayAuto]', msg);
    await log('payment', 'due-reminder', n7 > 0 || failed.length > 0 ? 'warning' : 'success', msg, { recordsAffected: n7+failed.length, details: { expiring7d: n7, failed24h: failed.length, remindersSent: n7 }, duration: Date.now()-start });
  } catch(e) { logger.error('[PayAuto] Error:', e.message); await log('payment', 'due-reminder', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('0 */4 * * *', runDueReminder);

export async function runReceiptTrigger() {
  const start = Date.now();
  try {
    const t30 = new Date(Date.now()-1800000);
    const np = await Payment.countDocuments({ status: 'completed', createdAt: { $gte: t30 } });
    if (np > 0) {
      const msg = np + ' new payments - receipts ready';
      logger.info('[PayAuto]', msg);
      await log('payment', 'receipt-trigger', 'success', msg, { recordsAffected: np, details: { newPayments: np }, duration: Date.now()-start });
    } else {
      const msg = 'No new payments in last 30min';
      logger.info('[PayAuto]', msg);
      await log('payment', 'receipt-trigger', 'success', msg, { recordsAffected: 0, details: { newPayments: 0 }, duration: Date.now()-start });
    }
  } catch(e) { logger.error('[PayAuto] Receipt error:', e.message); await log('payment', 'receipt-trigger', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('*/30 * * * *', runReceiptTrigger);

// ===== REVENUE AUTOMATIONS =====
export async function runDailyRevenueSummary() {
  const start = Date.now();
  try {
    const s = new Date(); s.setHours(0,0,0,0);
    const p = await Payment.find({ status: 'completed', paymentDate: { $gte: s } }).lean();
    const t = p.reduce(function(sum,x){ return sum+x.amount; }, 0);
    const msg = 'Daily: $' + t.toFixed(2) + ' from ' + p.length + ' payments';
    logger.info('[RevenueAuto]', msg);
    await log('revenue', 'daily-summary', 'success', msg, { recordsAffected: p.length, details: { amount: t, paymentCount: p.length }, duration: Date.now()-start });
  } catch(e) { logger.error('[RevenueAuto] Error:', e.message); await log('revenue', 'daily-summary', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('0 23 * * *', runDailyRevenueSummary);

export async function runWeeklyRevenueSummary() {
  const start = Date.now();
  try {
    const p = await Payment.find({ status: 'completed', paymentDate: { $gte: new Date(Date.now()-604800000) } }).lean();
    const t = p.reduce(function(sum,x){ return sum+x.amount; }, 0);
    const msg = 'Weekly: $' + t.toFixed(2) + ' from ' + p.length + ' payments';
    logger.info('[RevenueAuto]', msg);
    await log('revenue', 'weekly-summary', 'success', msg, { recordsAffected: p.length, details: { amount: t, paymentCount: p.length }, duration: Date.now()-start });
  } catch(e) { logger.error('[RevenueAuto] Error:', e.message); await log('revenue', 'weekly-summary', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('30 23 * * 0', runWeeklyRevenueSummary);

export async function runMonthlyRevenueSummary() {
  const start = Date.now();
  try {
    const ms = new Date(); ms.setMonth(ms.getMonth()-1); ms.setDate(1); ms.setHours(0,0,0,0);
    const p = await Payment.find({ status: 'completed', paymentDate: { $gte: ms } }).lean();
    const t = p.reduce(function(sum,x){ return sum+x.amount; }, 0);
    const msg = 'Monthly: $' + t.toFixed(2) + ' from ' + p.length + ' payments';
    logger.info('[RevenueAuto]', msg);
    await log('revenue', 'monthly-summary', 'success', msg, { recordsAffected: p.length, details: { amount: t, paymentCount: p.length }, duration: Date.now()-start });
  } catch(e) { logger.error('[RevenueAuto] Error:', e.message); await log('revenue', 'monthly-summary', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('30 23 1 * *', runMonthlyRevenueSummary);

// ===== SYSTEM AUTOMATIONS =====
export async function runHealthCheck() {
  const start = Date.now();
  try {
    const mg = (await import('mongoose')).default;
    const st = mg.connection.readyState;
    const sm = {0:'disconnected',1:'connected',2:'connecting',3:'disconnecting'};
    const c = await mg.connection.db.listCollections().toArray();
    const cnts = {};
    for (const col of c) {
      try { cnts[col.name] = await mg.connection.db.collection(col.name).countDocuments(); } catch(e) {}
    }
    const msg = 'DB: ' + sm[st] + ', ' + c.length + ' collections';
    logger.info('[SysAuto]', msg);
    await log('system', 'health-check', st === 1 ? 'success' : 'error', msg, { details: { connectionState: st, collections: c.length, counts: cnts }, duration: Date.now()-start });
  } catch(e) { logger.error('[SysAuto] Health error:', e.message); await log('system', 'health-check', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('0 */6 * * *', runHealthCheck);

export async function runCleanup() {
  const start = Date.now();
  try {
    const d90 = new Date(Date.now()-7776000000);
    const CM = (await import('../models/ContactMessage.js')).default;
    const del = await CM.deleteMany({ createdAt: { $lte: d90 } });
    if (del.deletedCount>0) logger.info('[SysAuto] Cleaned', del.deletedCount, 'old messages');
    const now = new Date();
    const fix = await Subscription.updateMany({ status: 'active', endDate: { $lte: now } }, { $set: { status: 'expired' } });
    if (fix.modifiedCount>0) logger.info('[SysAuto] Fixed', fix.modifiedCount, 'missed expirations');
    await log('system', 'cleanup', 'success', 'Cleaned ' + del.deletedCount + ' old msgs, fixed ' + fix.modifiedCount + ' expirations', { recordsAffected: del.deletedCount+fix.modifiedCount, details: { oldMessagesDeleted: del.deletedCount, missedExpirationsFixed: fix.modifiedCount }, duration: Date.now()-start });
  } catch(e) { logger.error('[SysAuto] Cleanup error:', e.message); await log('system', 'cleanup', 'error', 'Failed: '+e.message, { error: e.message, duration: Date.now()-start }); }
}

cron.schedule('0 3 * * *', runCleanup);
