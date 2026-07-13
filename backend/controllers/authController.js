import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone, role } = req.body;

    // ─── NoSQL Injection Protection ───
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input format' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password, fullName, phone, role });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ─── NoSQL Injection Protection ───
    // Reject non-string values for email and password to block MongoDB operator injection
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid credentials format' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, password, profileImage } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (password) user.password = password;

    await user.save();
    
    // Generate new token if email/password changes? Not strictly necessary unless we want to invalidate old tokens.
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
