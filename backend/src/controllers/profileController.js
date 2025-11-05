const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authorized.' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // if user is neither patient nor doctor, forbid profile updates
    if (!['patient', 'doctor'].includes(user.role)) {
      return res.status(403).json({ message: 'Profile updates are allowed for patients and doctors only.' });
    }

    if (user.role === 'patient') {
      const profile = await PatientProfile.findOne({ where: { userId } });
      return res.status(200).json({ user: { id: user.id, email: user.email, role: user.role }, profile });
    } else {
      const profile = await DoctorProfile.findOne({ where: { userId } });
      return res.status(200).json({ user: { id: user.id, email: user.email, role: user.role }, profile });
    }
  } catch (err) {
    console.error('Get profile error:', err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }

};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authorized.' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'patient') {
      const [profile, created] = await PatientProfile.findOrCreate({
        where: { userId },
        defaults: { userId }
      });
      await profile.update(req.body);
      return res.status(200).json({ message: 'Profile updated.', profile });
    } else if (user.role === 'doctor') {
      const [profile, created] = await DoctorProfile.findOrCreate({
        where: { userId },
        defaults: { userId }
      });
      await profile.update(req.body);
      return res.status(200).json({ message: 'Profile updated.', profile });
    } else {
      return res.status(400).json({ message: 'Invalid role.' });
    }
  } catch (err) {
    console.error('Get profile error:', err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    // Example: return a sample public profile (for testing)
    const user = await User.findOne({ attributes: ['id', 'email', 'role'], where: { email: 'patient@example.com' } });
    if (!user) return res.status(404).json({ message: 'Patient not found.' });
    res.status(200).json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getPublicProfile };
