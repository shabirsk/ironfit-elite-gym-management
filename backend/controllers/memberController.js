import Member from '../models/Member.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import { sendWelcomeEmail } from '../lib/email.js';
import { sendWhatsAppWelcome } from '../lib/whatsapp.js';

export const getMembers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const members = await Member.find(query)
      .populate('planId', 'planName price duration')
      .populate('trainerId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Member.countDocuments(query);
    res.json({ members, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('planId')
      .populate('trainerId', 'fullName email');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    const { email, fullName, phone } = req.body;
    
    // Check if Member already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ message: 'A member with this email already exists in the system.' });
    }

    // Check if User already exists
    let user = await User.findOne({ email });
    const tempPassword = user ? null : `IronFit@${Math.floor(1000 + Math.random() * 9000)}`;
    
    if (!user) {
      user = await User.create({
        email,
        password: tempPassword,
        fullName,
        phone: phone || '',
        role: 'member'
      });
    }

    const memberData = { ...req.body, userId: user._id };
    if (memberData.planId === '') delete memberData.planId;
    if (memberData.trainerId === '') delete memberData.trainerId;

    const member = await Member.create(memberData);
    
    const populated = await Member.findById(member._id)
      .populate('planId', 'planName price duration')
      .populate('trainerId', 'fullName email');
      
    // Send welcome email and WhatsApp (non-blocking, logged)
    sendWelcomeEmail(member, tempPassword).catch(err => console.error('[Email] Welcome email failed:', err.message));
    sendWhatsAppWelcome(member).catch(err => console.error('[WhatsApp] Welcome message failed:', err.message));
    
    // Create in-app notification
    import('../models/Notification.js').then(({ default: Notification }) => {
      Notification.create({
        userId: user._id,
        title: 'Welcome to IronFit Elite!',
        message: 'Your membership is now active. We are excited to have you on board!',
        type: 'Welcome Email',
        link: '/member/profile'
      }).catch(err => console.error('Failed to create in-app notification:', err.message));
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.planId === '') updateData.planId = null;
    if (updateData.trainerId === '') updateData.trainerId = null;

    const member = await Member.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('planId', 'planName price duration')
      .populate('trainerId', 'fullName email');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const convertLeadToMember = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { planId, trainerId, address, gender, joinDate } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (lead.status === 'converted') return res.status(400).json({ message: 'Lead already converted' });

    // Check if Member already exists
    const existingMember = await Member.findOne({ email: lead.email });
    if (existingMember) {
      // Auto-link the lead to the existing member instead of failing
      lead.status = 'converted';
      lead.convertedMemberId = existingMember._id;
      await lead.save();
      
      const populated = await Member.findById(existingMember._id)
        .populate('planId', 'planName price duration')
        .populate('trainerId', 'fullName email');

      return res.status(200).json({ 
        member: populated, 
        message: 'Lead was already a member. The lead has been successfully linked and marked as converted!' 
      });
    }

    // Check if User already exists
    let user = await User.findOne({ email: lead.email });
    const tempPassword = user ? null : `IronFit@${Math.floor(1000 + Math.random() * 9000)}`;
    
    if (!user) {
      user = await User.create({
        email: lead.email,
        password: tempPassword,
        fullName: lead.fullName,
        phone: lead.phone || '',
        role: 'member'
      });
    }

    const member = await Member.create({
      userId: user._id,
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      address,
      gender,
      joinDate: joinDate || new Date(),
      planId,
      trainerId,
    });

    lead.status = 'converted';
    lead.convertedMemberId = member._id;
    await lead.save();

    const populated = await Member.findById(member._id)
      .populate('planId', 'planName price duration')
      .populate('trainerId', 'fullName email');

    // Send welcome email and WhatsApp (non-blocking, logged)
    sendWelcomeEmail(member, tempPassword).catch(err => console.error('[Email] Welcome email (lead-convert) failed:', err.message));
    sendWhatsAppWelcome(member).catch(err => console.error('[WhatsApp] Welcome message (lead-convert) failed:', err.message));

    // Create in-app notification
    import('../models/Notification.js').then(({ default: Notification }) => {
      Notification.create({
        userId: user._id,
        title: 'Welcome to IronFit Elite!',
        message: 'Your membership is now active. We are excited to have you on board!',
        type: 'Welcome Email',
        link: '/member/profile'
      }).catch(err => console.error('Failed to create in-app notification:', err.message));
    });

    res.status(201).json({ member: populated, message: 'Lead converted to member successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
