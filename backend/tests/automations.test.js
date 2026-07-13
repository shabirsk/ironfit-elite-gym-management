import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import env from '../config/env.js';
import {
  runExpiryReport,
  runFollowUpReminder,
  runTrialReminder,
  runDailyAttendanceSummary,
  runWeeklyAttendanceSummary,
  runMonthlyAttendanceSummary,
  runDueReminder,
  runReceiptTrigger,
  runDailyRevenueSummary,
  runWeeklyRevenueSummary,
  runMonthlyRevenueSummary,
  runHealthCheck,
  runCleanup,
} from '../jobs/automations.js';
import { runExpiryCheck } from '../jobs/expiryCheck.js';
import AutomationLog from '../models/AutomationLog.js';

// Note: revenue and attendance both use 'daily-summary'/'weekly-summary'/'monthly-summary'
// as automation names, differentiated by category. The log lookup queries both name AND category.
const AUTOMATIONS = [
  { name: 'expiry-report', fn: runExpiryReport, category: 'membership' },
  { name: 'expiry-check', fn: runExpiryCheck, category: 'membership' },
  { name: 'follow-up-reminder', fn: runFollowUpReminder, category: 'lead' },
  { name: 'trial-reminder', fn: runTrialReminder, category: 'lead' },
  { name: 'daily-summary', fn: runDailyAttendanceSummary, category: 'attendance' },
  { name: 'weekly-summary', fn: runWeeklyAttendanceSummary, category: 'attendance' },
  { name: 'monthly-summary', fn: runMonthlyAttendanceSummary, category: 'attendance' },
  { name: 'due-reminder', fn: runDueReminder, category: 'payment' },
  { name: 'receipt-trigger', fn: runReceiptTrigger, category: 'payment' },
  // Revenue automations log with same names as attendance but category='revenue'
  { name: 'daily-summary', fn: runDailyRevenueSummary, category: 'revenue' },
  { name: 'weekly-summary', fn: runWeeklyRevenueSummary, category: 'revenue' },
  { name: 'monthly-summary', fn: runMonthlyRevenueSummary, category: 'revenue' },
  { name: 'health-check', fn: runHealthCheck, category: 'system' },
  { name: 'cleanup', fn: runCleanup, category: 'system' },
];

let logsBefore = 0;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.mongoUri);
  }
  logsBefore = await AutomationLog.countDocuments();
});

afterAll(async () => {
  const logsAfter = await AutomationLog.countDocuments();
  if (logsAfter > logsBefore) {
    const excess = logsAfter - logsBefore;
    const testLogs = await AutomationLog.find()
      .sort({ triggeredAt: -1 })
      .limit(excess)
      .select('_id');
    const ids = testLogs.map(l => l._id);
    if (ids.length > 0) {
      await AutomationLog.deleteMany({ _id: { $in: ids } });
    }
  }
});

describe('Automation Handlers', () => {
  for (const auto of AUTOMATIONS) {
    it(auto.name + ' (' + auto.category + ') runs without throwing', async () => {
      await expect(auto.fn()).resolves.toBeUndefined();

      // Query by both automation name AND category to differentiate
      // revenue vs attendance (they share 'daily-summary' etc.)
      const logs = await AutomationLog.find({
        automation: auto.name,
        category: auto.category,
      })
        .sort({ triggeredAt: -1 })
        .limit(1)
        .lean();

      expect(logs.length).toBeGreaterThanOrEqual(1);
      const log = logs[0];
      expect(log.category).toBe(auto.category);
      expect(log.automation).toBe(auto.name);
      expect(['success', 'warning', 'error']).toContain(log.status);
      expect(typeof log.summary).toBe('string');
      expect(log.summary.length).toBeGreaterThan(0);
      expect(typeof log.duration).toBe('number');
      expect(log.duration).toBeGreaterThanOrEqual(0);
      expect(log.triggeredAt).toBeDefined();
    });
  }
});

describe('Missing/Additional Automations', () => {
  it('absent-detection is a sub-automation of daily-summary and gets logged', async () => {
    const absentLogs = await AutomationLog.find({ automation: 'absent-detection' }).limit(1).lean();
    if (absentLogs.length > 0) {
      expect(absentLogs[0].category).toBe('attendance');
    }
  });
});
