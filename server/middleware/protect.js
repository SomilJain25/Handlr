const { verifyAccessToken } = require('../utils/generateTokens');

/**
 * Protects plain Express routes (e.g. /api/upload/*) with a JWT check.
 * GraphQL resolvers use middleware/auth.js's requireAuth/requireRole instead —
 * this one is for REST endpoints where there's no Apollo context.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    req.user = verifyAccessToken(token); // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = protect;