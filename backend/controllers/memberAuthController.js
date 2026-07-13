import User from '../models/User.js';
import Member from '../models/Member.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import generateToken from '../utils/generateToken.js';
import { sendEmailWithLog } from '../lib/email.js';
import env from '../config/env.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || typeof fullName !== 'string') {
      return res.status(400).json({ message: 'Invalid input format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Create User account with member role
    const user = await User.create({
      email,
      password,
      fullName,
      phone: phone || '',
      role: 'member',
    });

    // Create or link Member record to user
    const member = await Member.findOneAndUpdate(
      { email },
      { 
        $setOnInsert: { fullName, phone: phone || '' },
        $set: { userId: user._id }
      },
      { upsert: true, new: true }
    );

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        memberId: member._id,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid credentials format' });
    }

    const user = await User.findOne({ email, role: 'member' }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account has been deactivated. Contact the gym for support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Find the associated member record
    const member = await Member.findOne({ email: user.email });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        memberId: member?._id || null,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const member = await Member.findOne({ email: user.email })
      .populate('planId', 'planName price duration features')
      .populate('trainerId', 'fullName email phone specialization profileImage');

    res.json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
      },
      member: member || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName && typeof fullName === 'string') {
      user.fullName = fullName;
      await Member.findOneAndUpdate({ email: user.email }, { fullName });
    }
    if (phone !== undefined) {
      user.phone = phone;
      await Member.findOneAndUpdate({ email: user.email }, { phone });
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== 'string' || !email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if email not found (security best practice)
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate reset token
    const rawToken = await PasswordResetToken.generateToken(user._id);
    const resetUrl = `${env.frontendUrl}/member/reset-password/${rawToken}?email=${encodeURIComponent(email)}`;

    // Send email
    await sendEmailWithLog({
      to: email,
      category: 'auth',
      automation: 'password-reset',
      subject: 'Password Reset - IronFit Elite',
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
        <tr><td style="padding:40px 24px 20px;text-align:center;background:linear-gradient(135deg,#1a1a1a,#0d0d0d);border-bottom:3px solid #ff6200;">
        <h1 style="color:#fff;font-size:28px;margin:0;font-weight:800;">IRONFIT <span style="color:#ff6200;">ELITE</span></h1>
        <p style="color:#888;font-size:13px;">Premium Fitness Training</p></td></tr>
        <tr><td style="padding:32px 24px;background:#111;">
        <h2 style="color:#fff;font-size:20px;margin:0 0 16px;">Password Reset Request</h2>
        <p style="color:#ccc;font-size:14px;line-height:1.6;">Hi <strong style="color:#fff;">${user.fullName}</strong>,</p>
        <p style="color:#ccc;font-size:14px;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align:center;margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;background:#ff6200;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:600;">Reset Password</a>
        </div>
        <p style="color:#888;font-size:13px;">If you did not request a password reset, please ignore this email.</p>
        <p style="color:#888;font-size:13px;">Team IronFit Elite</p>
        </td></tr>
        <tr><td style="padding:24px;text-align:center;background:#0a0a0a;">
        <p style="color:#555;font-size:12px;margin:0;">IronFit Elite - Bangalore, India</p></td></tr>
        </table></body></html>
      `,
    });

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('[ForgotPassword] Error:', error.message);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { email, password } = req.body;

    if (typeof token !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid request format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const tokenDoc = await PasswordResetToken.verifyToken(user._id, token);
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = password;
    await user.save();

    tokenDoc.used = true;
    await tokenDoc.save();

    const authToken = generateToken(user._id);

    res.json({
      message: 'Password reset successful',
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[ResetPassword] Error:', error.message);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
};
