const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  // If email credentials aren't configured (e.g. local dev), log instead of failing.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('--- EMAIL (dev fallback, not actually sent) ---');
    console.log(`To: ${to}\nSubject: ${subject}\n${html}`);
    console.log('------------------------------------------------');
    return;
  }

  await getTransporter().sendMail({
    from: `"Handlr" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (user, token) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your Handlr account',
    html: `
      <p>Hi ${user.name},</p>
      <p>Welcome to Handlr! Please verify your email address to activate your account.</p>
      <p><a href="${link}">Verify my email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your Handlr password',
    html: `
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. Click the link below to choose a new one.</p>
      <p><a href="${link}">Reset my password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };