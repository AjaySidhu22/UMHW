const express = require('express');
const { registerUser, loginUser, requestPasswordReset, resetPassword } = require('../controllers/authController');
const { body } = require('express-validator');
const validate = require('../middlewares/validateMiddleware');
const { refreshAccessToken, logoutUser } = require('../controllers/authController');

const router = express.Router();

router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logoutUser);

// Register validation
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['patient', 'doctor', 'admin'])
      .withMessage('Role must be patient, doctor, or admin')
  ],
  validate,
  registerUser
);

// Login validation
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  loginUser
);

// Request password reset
router.post(
  '/request-password-reset',
  [ body('email').isEmail().withMessage('Valid email is required') ],
  validate,
  requestPasswordReset
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  validate,
  resetPassword
);

module.exports = router;
