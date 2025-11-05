 const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const protect = (req, res, next) => {
  let token = req.cookies.accessToken; // Check cookie first

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Fallback to header
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed.' });
  }
};

// Require Doctor or Admin
const requireDoctorOrAdmin = (req, res, next) => {
  if (req.user.role === 'doctor' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Doctor/Admin only' });
};

// Require Patient or Doctor
const requirePatientOrDoctor = (req, res, next) => {
  if (req.user.role === 'patient' || req.user.role === 'doctor' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Patient/Doctor/Admin only' });
};

module.exports = {
  protect,
  requireDoctorOrAdmin,
  requirePatientOrDoctor
};
