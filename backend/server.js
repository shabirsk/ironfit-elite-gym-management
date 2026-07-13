import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import uploadRoutes from './routes/uploads.js';
import exportRoutes from './routes/exports.js';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import env from './config/env.js';
import './jobs/expiryCheck.js';
import './jobs/automations.js';

import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import planRoutes from './routes/plans.js';
import memberRoutes from './routes/members.js';
import trainerRoutes from './routes/trainers.js';
import workoutRoutes from './routes/workouts.js';
import attendanceRoutes from './routes/attendance.js';
import subscriptionRoutes from './routes/subscriptions.js';
import paymentRoutes from './routes/payments.js';
import renewalRoutes from './routes/renewals.js';
import programRoutes from './routes/programs.js';
import razorpayRoutes from './routes/razorpay.js';
import whatsappRoutes from './routes/whatsapp.js';
import memberAuthRoutes from './routes/memberAuth.js';
import memberPortalRoutes from './routes/memberPortal.js';
import dietPlanRoutes from './routes/dietPlans.js';
import notificationRoutes from './routes/notifications.js';
import { sanitizeMiddleware, validateObjectId } from './lib/sanitize.js';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow multiple origins in development for hot-reload port changes
const corsOrigins = env.frontendUrl.split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    if (corsOrigins.some(o => origin === o)) {
      return callback(null, true);
    }
    // In development, allow any localhost port for convenience
    if (env.nodeEnv === 'development' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// Input sanitization (must be before routes to sanitize all incoming data)
app.use(sanitizeMiddleware);

// MongoDB ObjectId validation for route params (returns 400 on malformed IDs instead of 500)
app.use(validateObjectId);

// Rate limiting for auth routes (increased for tests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { message: 'Too many login attempts, please try again later' }
});
app.use('/api/auth', limiter);
app.use('/api/member-auth', limiter);
app.use('/api/member', limiter);

// Rate limiting on public contact/lead endpoints (prevent spam)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 submissions per hour per IP
  message: { message: 'Too many submissions. Please try again later.' },
});
app.use('/api/contact', contactLimiter);

// IMPORTANT: Razorpay webhook must be before express.json() — requires raw body
app.post('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }), (await import('./controllers/razorpayController.js')).handleWebhook);

// WhatsApp webhook — must be before express.json() for Meta verification
app.get('/api/whatsapp/webhook', (await import('./controllers/whatsappController.js')).verifyWebhook);
app.post('/api/whatsapp/webhook', express.raw({ type: 'application/json' }), (await import('./controllers/whatsappController.js')).handleWebhook);

// TEMPORARY: Admin fix endpoint — REMOVE AFTER USE
app.post('/api/fix-admin', express.json(), async (req, res) => {
  const { fixSecret } = req.body;
  if (fixSecret !== 'IRONFIT_FIX_2026_SECRET_ABCD1234') {
    return res.status(403).json({ message: 'Invalid secret' });
  }
  try {
    const User = (await import('./models/User.js')).default;
    let admin = await User.findOne({ email: 'admin@ironfit.com' });
    if (admin) {
      admin.password = 'admin123';
      await admin.save();
      return res.json({ message: 'Admin password reset to admin123' });
    }
    await User.create({
      email: 'admin@ironfit.com',
      password: 'admin123',
      fullName: 'Admin',
      role: 'admin',
      isActive: true,
    });
    res.json({ message: 'Admin user created: admin@ironfit.com / admin123' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Body parser with size limit (100kb handles workout plans with many exercises)
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
// Razorpay routes MUST come before /api/payments to avoid auth middleware collision
app.use('/api/payments/razorpay', razorpayRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/renewals', renewalRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/member-auth', memberAuthRoutes);
app.use('/api/member', memberPortalRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/exports', exportRoutes);

// Public stats endpoint (no auth required)
app.get('/api/public/stats', async (req, res) => {
  try {
    const Member = (await import('./models/Member.js')).default;
    const Trainer = (await import('./models/Trainer.js')).default;
    const Plan = (await import('./models/Plan.js')).default;
    const Program = (await import('./models/Program.js')).default;

    const [totalMembers, activeMembers, totalTrainers, activePlans, activePrograms] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
      Trainer.countDocuments({ status: 'active' }),
      Plan.countDocuments({ status: 'active' }),
      Program.countDocuments({ status: 'active' }),
    ]);

    res.json({
      totalMembers,
      activeMembers,
      totalTrainers,
      activePlans,
      activePrograms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Multer/file-size/file-filter error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: 'Upload error: ' + err.message });
  }
  // Handle fileFilter errors (multer passes plain Error for invalid file types)
  if (err.message && (err.message.includes('Invalid file type') || err.message.includes('file type'))) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start();
