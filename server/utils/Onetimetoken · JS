const crypto = require('crypto');

/**
 * Returns { rawToken, hashedToken }.
 * The raw token is emailed to the user; only the hashed version is stored
 * in the DB, so a DB leak alone can't be used to reset passwords.
 */
const createOneTimeToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

module.exports = { createOneTimeToken, hashToken };