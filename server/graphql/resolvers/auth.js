const User = require('../../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/generateTokens');
const { requireAuth } = require('../../middleware/auth');

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

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      user.refreshTokens = [refreshToken];
      await user.save();

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
  },
};
