import env from '../config/env.js';
import AutomationLog from '../models/AutomationLog.js';

/**
 * Normalize a phone number to E.164 format (+<country><number>).
 * Strips all non-digit characters and prepends +1 (US) if no country code detected.
 * @param {string} phone - Raw phone number input
 * @returns {string} Normalized E.164 phone number
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  // Strip everything except digits and leading +
  let digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('1') && digits.length === 11) {
    return '+' + digits;
  } else if (digits.length === 10) {
    // Assume US/CA number, prepend +1
    return '+1' + digits;
  } else if (digits.length > 11) {
    // Long number, just add +
    return '+' + digits;
  } else if (digits.length > 0) {
    // Shorter number, add + if not already
    return '+' + digits;
  }
  return phone.startsWith('+') ? phone : '+' + phone.replace(/[^\d+]/g, '');
};

/**
 * Log a WhatsApp message to AutomationLog.
 */
const logResult = async ({ to, template, status, summary, details = {} }) => {
  try {
    await AutomationLog.create({
      category: 'whatsapp',
      automation: template || 'whatsapp-send',
      status: status === 'sent' ? 'success' : 'error',
      summary,
      details: { to, template: template || 'text', ...details },
      recordsAffected: 1,
      duration: 0,
      triggeredAt: new Date(),
    });
  } catch (logErr) {
    console.error('[WhatsApp] Log failed:', logErr.message);
  }
};

export const isWhatsAppConfigured = () => {
  return !!(env.whatsappPhoneNumberId && env.whatsappAccessToken);
};

export const sendWhatsAppMessage = async (to, messageData, templateName = 'text') => {
  if (!isWhatsAppConfigured()) {
    const msg = 'WhatsApp not configured - missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN';
    console.warn('[WhatsApp]', msg);
    await logResult({ to, template: templateName, status: 'error', summary: msg });
    return { success: false, error: msg };
  }

  const url = 'https://graph.facebook.com/' + env.whatsappApiVersion + '/' + env.whatsappPhoneNumberId + '/messages';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.whatsappAccessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        ...messageData,
      }),
    });

    const data = await response.json();

    if (response.ok && data.messages?.[0]?.id) {
      const messageId = data.messages[0].id;
      await logResult({
        to,
        template: templateName,
        status: 'sent',
        summary: 'WhatsApp sent to ' + to + ': ' + templateName,
        details: { messageId, apiResponse: data },
      });
      return { success: true, messageId };
    } else {
      const errorMsg = data.error?.message || JSON.stringify(data);
      console.error('[WhatsApp] API error:', errorMsg);
      await logResult({
        to,
        template: templateName,
        status: 'error',
        summary: 'WhatsApp FAILED to ' + to + ': ' + templateName + ' - ' + errorMsg,
        details: { apiError: data.error || data },
      });
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    console.error('[WhatsApp] Network error:', error.message);
    await logResult({
      to,
      template: templateName,
      status: 'error',
      summary: 'WhatsApp FAILED to ' + to + ': ' + templateName + ' - ' + error.message,
      details: { error: error.message },
    });
    return { success: false, error: error.message };
  }
};

export const sendTextMessage = async (to, text, templateName = 'text') => {
  return sendWhatsAppMessage(to, {
    type: 'text',
    text: { body: text, preview_url: false },
  }, templateName);
};

export const sendWhatsAppWelcome = async (member) => {
  const phone = normalizePhone(member.phone);
  if (!phone) return { success: false, error: 'Member has no phone number' };
  return sendTextMessage(
    phone,
    'WELCOME to IronFit Elite!\n\nHi ' + member.fullName + ',\n\nWe are thrilled to have you as a member! Here is a quick summary:\n\nName: ' + member.fullName + '\nEmail: ' + (member.email || '---') + '\nPhone: ' + member.phone + '\n\nYour fitness journey starts now. See you at the gym!\n\nTeam IronFit Elite',
    'welcome'
  );
};

export const sendWhatsAppPaymentReceipt = async (member, payment, plan) => {
  const phone = normalizePhone(member.phone);
  if (!phone) return { success: false, error: 'Member has no phone number' };
  const planName = plan?.planName || payment?.planName || 'Membership';
  return sendTextMessage(
    phone,
    'PAYMENT RECEIPT - IronFit Elite\n\nHi ' + member.fullName + ',\n\nYour payment has been received successfully!\n\nPlan: ' + planName + '\nAmount: $' + payment.amount.toFixed(2) + '\nDate: ' + new Date(payment.paymentDate).toLocaleDateString() + '\nMethod: ' + payment.paymentMethod + '\nStatus: ' + payment.status + '\nTxn ID: ' + (payment.transactionId || '---') + '\n\nThank you for your payment!\n\nTeam IronFit Elite',
    'payment-receipt'
  );
};

export const sendWhatsAppTrainerAssignment = async (member, trainer) => {
  const phone = normalizePhone(member.phone);
  if (!phone) return { success: false, error: 'Member has no phone number' };
  return sendTextMessage(
    phone,
    'TRAINER ASSIGNED - IronFit Elite\n\nHi ' + member.fullName + ',\n\nA trainer has been assigned to guide you!\n\nTrainer: ' + trainer.fullName + '\nSpecialization: ' + (trainer.specialization || 'Personal Training') + '\nContact: ' + (trainer.phone || '---') + '\nEmail: ' + (trainer.email || '---') + '\n\nThey will help you achieve your fitness goals!\n\nTeam IronFit Elite',
    'trainer-assignment'
  );
};

export const sendWhatsAppWorkoutAssignment = async (member, workout) => {
  const phone = normalizePhone(member.phone);
  if (!phone) return { success: false, error: 'Member has no phone number' };
  return sendTextMessage(
    phone,
    'NEW WORKOUT ASSIGNED - IronFit Elite\n\nHi ' + member.fullName + ',\n\nA new workout plan is ready for you!\n\nWorkout: ' + workout.title + '\nDifficulty: ' + (workout.difficulty || 'Beginner') + '\nDuration: ' + (workout.durationWeeks || 'N/A') + ' weeks\nExercises: ' + (workout.exercises?.length || 0) + ' exercises\n\nTime to crush it! Check your dashboard for details.\n\nTeam IronFit Elite',
    'workout-assignment'
  );
};

export const sendWhatsAppExpiryReminder = async (member, subscription) => {
  const phone = normalizePhone(member.phone);
  if (!phone) return { success: false, error: 'Member has no phone number' };
  const daysLeft = Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  const planName = subscription.planId?.planName || 'Membership';
  const expiryDate = new Date(subscription.endDate).toLocaleDateString();
  return sendTextMessage(
    phone,
    'MEMBERSHIP EXPIRY REMINDER - IronFit Elite\n\nHi ' + member.fullName + ',\n\nYour membership is expiring soon!\n\nPlan: ' + planName + '\nExpires: ' + expiryDate + '\nDays Left: ' + daysLeft + '\n\nRenew now to continue enjoying unlimited access.\n\nTeam IronFit Elite',
    'expiry-reminder'
  );
};

export const sendWhatsAppRenewalConfirmation = async (member, subscription) => {
  const phone = normalizePhone(member.phone);
  if (!phone) return { success: false, error: 'Member has no phone number' };
  const planName = subscription.planId?.planName || 'Membership';
  const newEndDate = new Date(subscription.endDate).toLocaleDateString();
  return sendTextMessage(
    phone,
    'MEMBERSHIP RENEWED - IronFit Elite\n\nHi ' + member.fullName + ',\n\nGreat news! Your membership has been renewed successfully!\n\nPlan: ' + planName + '\nNew Expiry: ' + newEndDate + '\nStatus: Active\n\nThank you for being a valued member!\n\nTeam IronFit Elite',
    'renewal-confirmation'
  );
};
