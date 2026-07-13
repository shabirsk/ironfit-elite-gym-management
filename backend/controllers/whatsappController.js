import logger from '../utils/logger.js';
import * as whatsapp from '../lib/whatsapp.js';
import Member from '../models/Member.js';
import Payment from '../models/Payment.js';
import Plan from '../models/Plan.js';
import Trainer from '../models/Trainer.js';
import Workout from '../models/Workout.js';
import Subscription from '../models/Subscription.js';
import env from '../config/env.js';

/**
 * GET /api/whatsapp/webhook
 * Meta sends a GET request to verify the webhook.
 */
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.whatsappVerifyToken) {
    logger.info('[WhatsApp] Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  logger.warn('[WhatsApp] Webhook verification failed - token mismatch');
  return res.status(403).json({ message: 'Verification failed' });
};

/**
 * POST /api/whatsapp/webhook
 * Meta sends inbound messages and status updates here.
 * The body may be a raw Buffer (from express.raw() in server.js) or parsed JSON.
 */
export const handleWebhook = (req, res) => {
  // Always respond 200 to acknowledge receipt
  res.status(200).json({ status: 'received' });

  try {
    // Handle both raw Buffer (from express.raw) and parsed JSON body
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString('utf8'));
      } catch (parseErr) {
        logger.error('[WhatsApp] Failed to parse webhook body:', parseErr.message);
        return;
      }
    }

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) return;

    // Handle incoming messages
    const messages = value.messages || [];
    for (const msg of messages) {
      logger.info('[WhatsApp] Incoming message from', msg.from, ':', msg.text?.body || '(non-text)');
    }

    // Handle message status updates
    const statuses = value.statuses || [];
    for (const st of statuses) {
      logger.info('[WhatsApp] Status update:', st.id, '-', st.status);
    }
  } catch (error) {
    logger.error('[WhatsApp] Webhook handler error:', error.message);
  }
};

/**
 * POST /api/whatsapp/send
 * Send a WhatsApp message to a specific number.
 */
export const sendMessage = async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ message: 'Phone number (to) and message text are required' });
    }

    const result = await whatsapp.sendTextMessage(to, message, 'admin-send');

    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/whatsapp/send-welcome
 * Send welcome message to a member.
 */
export const sendWelcome = async (req, res) => {
  try {
    const { memberId } = req.body;
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    const result = await whatsapp.sendWhatsAppWelcome(member);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/whatsapp/send-receipt
 * Send payment receipt to a member.
 */
export const sendReceipt = async (req, res) => {
  try {
    const { memberId, paymentId } = req.body;
    const [member, payment] = await Promise.all([
      Member.findById(memberId),
      Payment.findById(paymentId),
    ]);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const plan = payment.subscriptionId
      ? await Plan.findById((await Subscription.findById(payment.subscriptionId))?.planId)
      : null;
    const result = await whatsapp.sendWhatsAppPaymentReceipt(member, payment, plan);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/whatsapp/send-trainer-assignment
 * Send trainer assignment message.
 */
export const sendTrainerMsg = async (req, res) => {
  try {
    const { memberId, trainerId } = req.body;
    const [member, trainer] = await Promise.all([
      Member.findById(memberId),
      Trainer.findById(trainerId),
    ]);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    const result = await whatsapp.sendWhatsAppTrainerAssignment(member, trainer);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/whatsapp/send-workout
 * Send workout assignment message.
 */
export const sendWorkoutMsg = async (req, res) => {
  try {
    const { memberId, workoutId } = req.body;
    const [member, workout] = await Promise.all([
      Member.findById(memberId),
      Workout.findById(workoutId),
    ]);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    const result = await whatsapp.sendWhatsAppWorkoutAssignment(member, workout);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/whatsapp/status
 * Check if WhatsApp is configured and working.
 */
export const getStatus = (req, res) => {
  res.json({
    configured: whatsapp.isWhatsAppConfigured(),
    phoneNumberId: env.whatsappPhoneNumberId ? env.whatsappPhoneNumberId.substring(0, 8) + '...' : null,
    hasAccessToken: !!env.whatsappAccessToken,
  });
};
