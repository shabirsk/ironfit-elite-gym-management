import mongoose from 'mongoose';
import crypto from 'crypto';

const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

passwordResetTokenSchema.statics.generateToken = async function (userId) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  await this.create({
    userId,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return rawToken;
};

passwordResetTokenSchema.statics.verifyToken = async function (userId, rawToken) {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenDoc = await this.findOne({
    userId,
    token: hashedToken,
    used: false,
    expiresAt: { $gt: new Date() },
  });
  return tokenDoc;
};

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;
