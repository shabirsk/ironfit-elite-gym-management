import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Member from '../models/Member.js';
import AutomationLog from '../models/AutomationLog.js';
import logger from '../utils/logger.js';

export async function logAudit(category, automation, status, summary, details, duration) {
  try {
    await AutomationLog.create({
      category,
      automation,
      status,
      summary,
      details,
      recordsAffected: 1,
      duration,
      triggeredAt: new Date(),
    });
  } catch (e) {
    logger.error('[Razorpay] Audit log failed:', e.message);
  }
}

export async function handlePaymentCaptured(payload) {
  const { payment } = payload;
  const orderId = payment.order_id;
  const paymentId = payment.id;

  const existing = await Payment.findOne({ razorpayPaymentId: paymentId });
  if (existing) return;

  const pendingPayment = await Payment.findOne({ razorpayOrderId: orderId });
  if (!pendingPayment) {
    logger.info(`[Razorpay] Webhook: No pending payment found for order ${orderId}`);
    return;
  }

  if (pendingPayment.status === 'completed') return;

  pendingPayment.razorpayPaymentId = paymentId;
  pendingPayment.status = 'completed';
  pendingPayment.transactionId = paymentId;
  pendingPayment.paymentDate = new Date(payment.created_at ? new Date(payment.created_at * 1000) : new Date());
  pendingPayment.notes = 'Online payment completed via Razorpay (webhook)';
  await pendingPayment.save();

  if (pendingPayment.planId) {
    const plan = await Plan.findById(pendingPayment.planId);
    if (plan) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration);

      await Subscription.create({
        memberId: pendingPayment.memberId,
        planId: plan._id,
        startDate,
        endDate,
        status: 'active',
      });

      await Member.findByIdAndUpdate(pendingPayment.memberId, {
        planId: plan._id,
        status: 'active',
      });
    }
  }

  await logAudit('payment', 'razorpay-webhook-captured', 'success',
    `Webhook: Payment ${paymentId} captured for order ${orderId}`,
    { orderId, paymentId, amount: pendingPayment.amount },
    0
  );
}

export async function handlePaymentFailed(payload) {
  const { payment } = payload;
  const orderId = payment.order_id;

  await Payment.findOneAndUpdate(
    { razorpayOrderId: orderId },
    {
      status: 'failed',
      razorpayPaymentId: payment.id,
      notes: `Payment failed: ${payment.error_description || 'Unknown error'}`,
    }
  );

  await logAudit('payment', 'razorpay-webhook-failed', 'error',
    `Webhook: Payment failed for order ${orderId} — ${payment.error_description || 'Unknown'}`,
    { orderId, paymentId: payment.id, error: payment.error_description },
    0
  );
}

export async function handlePaymentRefunded(payload) {
  const { payment } = payload;
  const paymentId = payment.id;

  const existing = await Payment.findOne({ razorpayPaymentId: paymentId });
  if (existing) {
    existing.status = 'refunded';
    existing.notes = `Refunded via Razorpay. Amount: ₹${(payment.amount_refunded || 0) / 100}`;
    await existing.save();

    if (existing.subscriptionId) {
      await Subscription.findByIdAndUpdate(existing.subscriptionId, {
        status: 'cancelled',
        autoRenew: false,
      });
    }
  }

  await logAudit('payment', 'razorpay-webhook-refunded', 'warning',
    `Webhook: Payment ${paymentId} refunded`,
    { paymentId, amountRefunded: payment.amount_refunded },
    0
  );
}
