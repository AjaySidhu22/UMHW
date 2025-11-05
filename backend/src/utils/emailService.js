const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendResetEmail(to, token) {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Universal Medical Wallet" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <h3>Password Reset</h3>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset it:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Reset email sent to ${to}`);
}

module.exports = { sendResetEmail };
