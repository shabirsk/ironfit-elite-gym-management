import Lead from '../models/Lead.js';
import ContactMessage from '../models/ContactMessage.js';
import { sendLeadNotification } from '../lib/email.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Create a lead from the contact submission
    const lead = await Lead.create({
      fullName: name,
      email,
      phone,
      source: 'website',
      status: 'new',
      notes: `Initial contact: ${message?.substring(0, 100)}`,
    });

    // Save the full message
    await ContactMessage.create({ name, email, phone, message });

    // Send lead notification (non-blocking, logged)
    sendLeadNotification(lead).catch(err => console.error('[Email] Lead notification failed:', err.message));

    res.status(201).json({
      message: 'Thank you for reaching out! We will contact you soon.',
      leadId: lead._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
