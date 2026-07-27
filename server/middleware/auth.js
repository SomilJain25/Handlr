const { verifyAccessToken } = require('../utils/generateTokens');

/**
 * Extracts and verifies the user from the Authorization header.
 * Used inside the Apollo Server `context` function so every
 * resolver has access to `context.user`.
 */
const getUserFromReq = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return null;

  try {
    const decoded = verifyAccessToken(token);
    return decoded; // { id, role, iat, exp }
  } catch (err) {
    return null; // invalid/expired token -> treated as unauthenticated
  }
};

/**
 * Helper resolvers call to guard protected fields/mutations.
 */
const requireAuth = (context) => {
  if (!context.user) {
    const err = new Error('You must be logged in to perform this action.');
    err.extensions = { code: 'UNAUTHENTICATED' };
    throw err;
  }
  return context.user;
};

const requireRole = (context, roles = []) => {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    const err = new Error('You do not have permission to perform this action.');
    err.extensions = { code: 'FORBIDDEN' };
    throw err;
  }
  return user;
};

module.exports = { getUserFromReq, requireAuth, requireRole };
