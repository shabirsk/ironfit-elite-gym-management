import mongoose from 'mongoose';
import env from '../config/env.js';
import AutomationLog from '../models/AutomationLog.js';

const AUTOMATIONS = [
  { category: 'membership', automation: 'expiry-report', status: 'success', summary: 'Expiring: TODAY=0 | 7d=2 | 30d=5', recordsAffected: 7, details: { expToday: 0, exp7d: 2, exp30d: 5 } },
  { category: 'membership', automation: 'expiry-check', status: 'success', summary: 'Renewed 0, expired 0 subscriptions', recordsAffected: 0, details: { autoRenewed: 0, expired: 0 } },
  { category: 'lead', automation: 'follow-up-reminder', status: 'success', summary: 'Uncontacted >24h: 1 | >48h: 0', recordsAffected: 1, details: { uncontacted24h: 1, uncontacted48h: 0 } },
  { category: 'lead', automation: 'trial-reminder', status: 'success', summary: 'Stale trials: 0 (>3d) | Auto-lost: 0 (>7d)', recordsAffected: 0, details: { stale3d: 0, autoLost: 0 } },
  { category: 'attendance', automation: 'daily-summary', status: 'success', summary: '8 records: 6P/1L/1A', recordsAffected: 8, details: { present: 6, late: 1, absent: 1 } },
  { category: 'attendance', automation: 'absent-detection', status: 'warning', summary: 'Alice Johnson absent 3/5 days', recordsAffected: 1, details: { memberName: 'Alice Johnson', absentDays: 3 } },
  { category: 'attendance', automation: 'weekly-summary', status: 'success', summary: '35 records, 12 unique members', recordsAffected: 35, details: { records: 35, uniqueMembers: 12 } },
  { category: 'attendance', automation: 'monthly-summary', status: 'success', summary: '120 records, 16 unique members', recordsAffected: 120, details: { records: 120, uniqueMembers: 16 } },
  { category: 'payment', automation: 'due-reminder', status: 'success', summary: 'Subs expiring in 7d: 2 | Failed (24h): 0', recordsAffected: 2, details: { expiring7d: 2, failed24h: 0 } },
  { category: 'payment', automation: 'receipt-trigger', status: 'success', summary: '3 new payments - receipts ready', recordsAffected: 3, details: { newPayments: 3 } },
  { category: 'revenue', automation: 'daily-summary', status: 'success', summary: 'Daily: $149.97 from 3 payments', recordsAffected: 3, details: { amount: 149.97, paymentCount: 3 } },
  { category: 'revenue', automation: 'weekly-summary', status: 'success', summary: 'Weekly: $589.80 from 12 payments', recordsAffected: 12, details: { amount: 589.80, paymentCount: 12 } },
  { category: 'revenue', automation: 'monthly-summary', status: 'success', summary: 'Monthly: $2,199.50 from 45 payments', recordsAffected: 45, details: { amount: 2199.50, paymentCount: 45 } },
  { category: 'system', automation: 'health-check', status: 'success', summary: 'DB: connected, 8 collections', recordsAffected: 0, details: { connectionState: 1, collections: 8 } },
  { category: 'system', automation: 'cleanup', status: 'success', summary: 'Cleaned 0 old msgs, fixed 0 expirations', recordsAffected: 0, details: { oldMessagesDeleted: 0, missedExpirationsFixed: 0 } },
];

async function seed() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');
    await AutomationLog.deleteMany({});
    console.log('Cleared existing automation logs');
    const now = Date.now();
    const logs = [];
    for (let i = 0; i < AUTOMATIONS.length; i++) {
      logs.push({ ...AUTOMATIONS[i], duration: Math.floor(Math.random() * 500) + 50, triggeredAt: new Date(now - (AUTOMATIONS.length - i) * 3600000) });
    }
    await AutomationLog.insertMany(logs);
    console.log('Seeded ' + logs.length + ' automation logs');
    await mongoose.disconnect();
    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}
seed();
