const { sendResetEmail } = require('../utils/emailService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


// Generate Access + Refresh Tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }  // shorter life
  );

  const refreshToken = crypto.randomBytes(40).toString('hex'); // random string
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return { accessToken, refreshToken, refreshTokenExpiry };
};

// Register user
const registerUser = async (req, res, next) => {
  const { email, password, role } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'User already exists.' });

    const newUser = await User.create({ email, password, role: role || 'patient' });
    const safeUser = { id: newUser.id, email: newUser.email, role: newUser.role };

    res.status(201).json({ message: 'User registered successfully!', user: safeUser });
  } catch (err) {
    console.error('Registration error:', err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};


const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    // Generate tokens
    const { accessToken, refreshToken, refreshTokenExpiry } = generateTokens(user);

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    await user.save();

    // ✅ Send refreshToken in HttpOnly cookie, accessToken in JSON
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Corrected line
        sameSite: 'strict',
        expires: refreshTokenExpiry
      })
      .cookie('accessToken', accessToken, { // Add this
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
      })
      .status(200)
      .json({
        message: 'Login successful!',
        user: { id: user.id, email: user.email, role: user.role },
        accessToken
      });
  } catch (err) {
    console.error('Login error:', err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

// Refresh Access Token
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken; // ✅ from cookie
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const user = await User.findOne({ where: { refreshToken } });
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    if (new Date() > new Date(user.refreshTokenExpiry)) {
      return res.status(403).json({ message: 'Refresh token expired. Please log in again.' });
    }

    // issue new access token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// Logout (clear refresh token)
const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const user = await User.findOne({ where: { refreshToken } });
    if (user) {
      user.refreshToken = null;
      user.refreshTokenExpiry = null;
      await user.save();
    }

    // ✅ clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};


// Step 1: Request password reset (now stores HASH of token, not raw token)
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always respond generically to avoid revealing whether email exists
    if (!user) {
      return res.status(200).json({
        message: 'If this email exists, a password reset link has been sent to your email.'
      });
    }

    // generate raw token (sent to user) and a SHA256 hash to store in DB
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetTokenHash;         // store hash, not raw
    user.resetTokenExpiry = expiry;
    await user.save();

    // send raw token in email link
    await sendResetEmail(email, resetToken);

    return res.status(200).json({
      message: 'If this email exists, a password reset link has been sent to your email.'
    });

  } catch (err) {
    next(err);
  }
};

// Step 2: Reset password (validates by hashing the provided token)
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    // hash incoming token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ where: { resetToken: tokenHash } });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    if (new Date() > new Date(user.resetTokenExpiry)) {
      // invalidate stored values
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'Token expired' });
    }

    // update password (bcrypt) and clear token fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  refreshAccessToken,
  logoutUser
};



