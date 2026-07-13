import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import Member from '../models/Member.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import AutomationLog from '../models/AutomationLog.js';
import { getRazorpay, verifyPaymentSignature, verifyWebhookSignature } from '../lib/razorpay.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import { logAudit, handlePaymentCaptured, handlePaymentFailed, handlePaymentRefunded } from '../services/paymentService.js';
import { sendPaymentReceipt } from '../lib/email.js';

/**
 * Step 1: Create a Razorpay Order for the selected plan
 * POST /api/payments/razorpay/create-order
 * Body: { planId, memberId }
 */
export const createOrder = async (req, res) => {
  let start = Date.now();
  try {
    const { planId, memberId } = req.body;

    if (!planId || !memberId) {
      return res.status(400).json({ message: 'planId and memberId are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ message: 'Invalid plan ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: 'Invalid member ID format' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Check for existing active subscription
    const existingActive = await Subscription.findOne({ memberId, status: 'active' });
    if (existingActive) {
      return res.status(400).json({
        message: 'Member already has an active subscription. Cancel it before creating a new one.',
      });
    }

    // Convert price to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(plan.price * 100);

    // Generate a unique receipt ID
    const receipt = `rcpt_${memberId.toString().slice(-8)}_${Date.now()}`;

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        planId: planId.toString(),
        memberId: memberId.toString(),
        planName: plan.planName,
        memberName: member.fullName,
      },
    });

    // Pre-create a payment record in pending state for audit trail
    const payment = await Payment.create({
      memberId,
      planId: plan._id,
      amount: plan.price,
      paymentMethod: 'online',
      paymentDate: new Date(),
      transactionId: razorpayOrder.id,
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      paymentType: 'online',
      notes: `Razorpay order created for plan: ${plan.planName}`,
    });

    await logAudit('payment', 'razorpay-order-created', 'success',
      `Order ${razorpayOrder.id} for ${member.fullName} - ₹${plan.price}`,
      { orderId: razorpayOrder.id, planName: plan.planName, memberName: member.fullName, amount: plan.price },
      Date.now() - start
    );

    res.json({
      success: true,
      order: razorpayOrder,
      paymentId: payment._id,
      keyId: env.razorpayKeyId,
      plan: { name: plan.planName, price: plan.price, duration: plan.duration },
      member: { name: member.fullName, email: member.email, phone: member.phone },
    });
  } catch (error) {
    logger.error('[Razorpay] Create order error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format provided' });
    }
    await logAudit('payment', 'razorpay-order-created', 'error',
      'Order creation failed: ' + error.message,
      { error: error.message },
      0
    );
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
};

/**
 * Step 2: Verify payment signature after successful Razorpay checkout
 * POST /api/payments/razorpay/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPayment = async (req, res) => {
  const start = Date.now();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment verification fields' });
    }

    // Verify HMAC SHA256 signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      // Mark the payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: 'failed',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          notes: 'Signature verification failed',
        }
      );

      await logAudit('payment', 'razorpay-verify', 'error',
        `Signature verification failed for order ${razorpay_order_id}`,
        { orderId: razorpay_order_id, paymentId: razorpay_payment_id },
        Date.now() - start
      );

      return res.status(400).json({ message: 'Payment signature verification failed' });
    }

    // Find the pending payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found for this order' });
    }

    // Validate payment.memberId and payment.planId exist before using them
    if (!payment.memberId || !payment.planId) {
      return res.status(400).json({ message: 'Payment record is missing member or plan reference' });
    }

    // Check if already processed (idempotency)
    if (payment.status === 'completed') {
      const existingSub = await Subscription.findOne({ memberId: payment.memberId, status: 'active' });
      return res.json({
        success: true,
        alreadyProcessed: true,
        payment,
        subscription: existingSub,
      });
    }

    // Update payment record with success details
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'completed';
    payment.transactionId = razorpay_payment_id;
    payment.paymentDate = new Date();
    payment.notes = 'Online payment completed via Razorpay';
    await payment.save();

    // Create subscription from the plan
    const plan = await Plan.findById(payment.planId);
    if (!plan) {
      // Fallback: try to find plan from the order notes
      payment.notes = 'Subscription creation skipped: plan not found';
      await payment.save();
      return res.json({ success: true, payment, subscription: null, warning: 'Plan not found' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    const subscription = await Subscription.create({
      memberId: payment.memberId,
      planId: plan._id,
      startDate,
      endDate,
      status: 'active',
    });

    // Update member
    await Member.findByIdAndUpdate(payment.memberId, {
      planId: plan._id,
      status: 'active',
    });

    await logAudit('payment', 'razorpay-payment-success', 'success',
      `Payment ${razorpay_payment_id} verified — ₹${payment.amount} — ${plan.planName} activated`,
      {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: payment.amount,
        planName: plan.planName,
        subscriptionId: subscription._id,
      },
      Date.now() - start
    );

    // Send payment receipt email (non-blocking, logged)
    const pmember = await Member.findById(payment.memberId).select('fullName email userId phone');
    if (pmember) {
      sendPaymentReceipt(pmember, payment, plan).catch(err => logger.error('[Email] Payment receipt failed:', err.message));
      
      // Create in-app notification
      if (pmember.userId) {
        import('../models/Notification.js').then(({ default: Notification }) => {
          Notification.create({
            userId: pmember.userId,
            title: 'Payment Successful!',
            message: `Your payment of ₹${payment.amount} for ${plan.planName} has been received. Your membership is now active until ${endDate.toLocaleDateString()}.`,
            type: 'Payment',
            link: '/member/payments'
          }).catch(err => logger.error('Failed to create in-app notification:', err.message));
        });
      }
      
      // Send WhatsApp receipt if configured
      import('../lib/whatsapp.js').then(({ sendWhatsAppPaymentReceipt }) => {
        sendWhatsAppPaymentReceipt(pmember, payment, plan).catch(err => logger.error('[WhatsApp] Payment receipt failed:', err.message));
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      alreadyProcessed: false,
      payment: await Payment.findById(payment._id).populate('memberId', 'fullName email phone'),
      subscription: await Subscription.findById(subscription._id)
        .populate('memberId', 'fullName email phone')
        .populate('planId', 'planName price duration'),
    });
  } catch (error) {
    logger.error('[Razorpay] Verify error:', error.message);
    await logAudit('payment', 'razorpay-verify', 'error',
      'Payment verification failed: ' + error.message,
      { error: error.message },
      Date.now() - start
    );
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

/**
 * Webhook: Handle Razorpay async events
 * POST /api/payments/razorpay/webhook
 * Note: This route uses express.raw() body parser — registered BEFORE global express.json()
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ message: 'Missing webhook signature' });
    }

    // Verify webhook signature using raw body
    const rawBody = req.body.toString();
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.error('[Razorpay] Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody);
    const { event: eventName, payload } = event;

    switch (eventName) {
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      case 'payment.refunded':
        await handlePaymentRefunded(payload);
        break;
      default:
        logger.info(`[Razorpay] Unhandled webhook event: ${eventName}`);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    logger.error('[Razorpay] Webhook error:', error.message);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

/**
 * Refund a Razorpay payment
 * POST /api/payments/razorpay/refund/:paymentId
 * Body: { amount } (optional, in rupees, for partial refund)
 */
export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (!payment.razorpayPaymentId) {
      return res.status(400).json({ message: 'Payment has no Razorpay reference. Only online payments can be refunded via Razorpay.' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    const refundData = {};
    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to paise for partial refund
    }

    const refund = await getRazorpay().payments.refund(payment.razorpayPaymentId, refundData);

    payment.status = 'refunded';
    payment.notes = `Refund issued: ₹${amount || (payment.amount).toFixed(2)} | Razorpay refund_id: ${refund.id}`;
    await payment.save();

    // Cancel associated subscription if exists
    if (payment.subscriptionId) {
      await Subscription.findByIdAndUpdate(payment.subscriptionId, {
        status: 'cancelled',
        autoRenew: false,
      });
    }

    await logAudit('payment', 'razorpay-refund', 'success',
      `Refund ₹${amount || payment.amount} for payment ${payment.razorpayPaymentId}`,
      { refundId: refund.id, paymentId: payment.razorpayPaymentId, amount: amount || payment.amount },
      0
    );

    res.json({ success: true, refund, payment });
  } catch (error) {
    logger.error('[Razorpay] Refund error:', error.message);
    await logAudit('payment', 'razorpay-refund', 'error',
      'Refund failed: ' + error.message,
      { error: error.message, paymentId: req.params.paymentId },
      0
    );
    res.status(500).json({ message: 'Refund failed', error: error.message });
  }
};

/**
 * List all Razorpay orders
 * GET /api/payments/razorpay/orders
 */
export const listOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { paymentType: 'online' };

    const payments = await Payment.find(query)
      .populate('memberId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({ payments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

