/**
 * Creates a new admin account, or promotes an existing user to admin if the
 * email already exists.
 *
 * Usage:
 *   node utils/createAdmin.js admin@handlr.com "Admin Name" SomeStrongPassword123
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

async function run() {
  const [, , email, name, password] = process.argv;

  if (!email || !name || !password) {
    console.error('Usage: node utils/createAdmin.js <email> <name> <password>');
    process.exit(1);
  }

  await connectDB();

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    user.role = 'admin';
    user.isVerified = true;
    await user.save();
    console.log(`Existing user ${email} promoted to admin.`);
  } else {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      isVerified: true,
    });
    console.log(`Admin account created: ${email}`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});