const User = require('../../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/generateTokens');
const { requireAuth } = require('../../middleware/auth');
const { createOneTimeToken, hashToken } = require('../../utils/oneTimeToken');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../../services/emailService');

module.exports = {
  Query: {
    _health: () => 'ok',
    me: async (_, __, context) => {
      const authUser = requireAuth(context);
      return User.findById(authUser.id);
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      const { name, email, password, role } = input;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        throw new Error('An account with this email already exists.');
      }

      const user = await User.create({ name, email, password, role });

      const { rawToken, hashedToken } = createOneTimeToken();
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      user.refreshTokens = [refreshToken];
      await user.save();

      // Don't block registration on email delivery issues.
      sendVerificationEmail(user, rawToken).catch((err) =>
        console.error('Failed to send verification email:', err.message)
      );

      return { accessToken, refreshToken, user };
    },

    login: async (_, { input }) => {
      const { email, password } = input;

      const user = await User.findOne({ email: email.toLowerCase() }).select(
        '+password +refreshTokens'
      );
      if (!user) throw new Error('Invalid email or password.');
      if (user.isSuspended) throw new Error('This account has been suspended.');

      const valid = await user.comparePassword(password);
      if (!valid) throw new Error('Invalid email or password.');

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      user.refreshTokens.push(refreshToken);
      await user.save();

      return { accessToken, refreshToken, user };
    },

    refreshToken: async (_, { token }) => {
      let decoded;
      try {
        decoded = verifyRefreshToken(token);
      } catch (err) {
        throw new Error('Invalid or expired refresh token.');
      }

      const user = await User.findById(decoded.id).select('+refreshTokens');
      if (!user || !user.refreshTokens.includes(token)) {
        throw new Error('Refresh token not recognized.');
      }

      const accessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);
      user.refreshTokens = user.refreshTokens
        .filter((t) => t !== token)
        .concat(newRefreshToken);
      await user.save();

      return { accessToken, refreshToken: newRefreshToken, user };
    },

    logout: async (_, __, context) => {
      const authUser = requireAuth(context);
      await User.findByIdAndUpdate(authUser.id, { refreshTokens: [] });
      return true;
    },

    forgotPassword: async (_, { email }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      // Always return true, even if no account exists — prevents email enumeration.
      if (!user) return true;

      const { rawToken, hashedToken } = createOneTimeToken();
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      sendPasswordResetEmail(user, rawToken).catch((err) =>
        console.error('Failed to send password reset email:', err.message)
      );

      return true;
    },

    resetPassword: async (_, { token, newPassword }) => {
      const hashed = hashToken(token);
      const user = await User.findOne({
        passwordResetToken: hashed,
        passwordResetExpires: { $gt: Date.now() },
      }).select('+passwordResetToken +passwordResetExpires +refreshTokens');

      if (!user) {
        throw new Error('Password reset link is invalid or has expired.');
      }

      user.password = newPassword; // pre-save hook re-hashes it
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.refreshTokens = []; // force re-login on all devices
      await user.save();

      return true;
    },

    resendVerificationEmail: async (_, __, context) => {
      const authUser = requireAuth(context);
      const user = await User.findById(authUser.id);
      if (!user) throw new Error('User not found.');
      if (user.isVerified) return true;

      const { rawToken, hashedToken } = createOneTimeToken();
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();

      await sendVerificationEmail(user, rawToken);
      return true;
    },

    verifyEmail: async (_, { token }) => {
      const hashed = hashToken(token);
      const user = await User.findOne({
        emailVerificationToken: hashed,
        emailVerificationExpires: { $gt: Date.now() },
      }).select('+emailVerificationToken +emailVerificationExpires');

      if (!user) {
        throw new Error('Verification link is invalid or has expired.');
      }

      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return true;
    },
  },
};