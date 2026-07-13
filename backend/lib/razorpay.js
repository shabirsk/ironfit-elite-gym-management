import crypto from 'crypto';
import { createRequire } from 'module';
import env from '../config/env.js';

const _require = createRequire(import.meta.url);

let _razorpay = null;

/**
 * Get or initialize the Razorpay instance lazily.
 * This prevents crashes at import time when env vars are missing.
 */
export function getRazorpay() {
  if (_razorpay) return _razorpay;

  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error(
      'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
    );
  }

  const Razorpay = _require('razorpay');
  _razorpay = new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
  return _razorpay;
}

/**
 * Verify HMAC SHA256 signature returned by Razorpay after payment
 * @param {string} orderId - razorpay_order_id
 * @param {string} paymentId - razorpay_payment_id  
 * @param {string} signature - razorpay_signature from checkout response
 * @returns {boolean}
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expectedSignature === signature;
};

/**
 * Verify Razorpay webhook signature
 * @param {string} body - raw request body as string
 * @param {string} signature - X-Razorpay-Signature header value
 * @returns {boolean}
 */
export const verifyWebhookSignature = (body, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayWebhookSecret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};
