const User = require('../models/User');

// GET all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt']
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// DELETE a user by ID
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// UPDATE a user’s role (safe)
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // validate
    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // prevent self-demotion
    if (req.user && String(req.user.id) === String(id) && role !== 'admin') {
      return res.status(400).json({ message: "You cannot remove your own admin role." });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // prevent removing last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last admin.' });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'Role updated successfully',
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, deleteUser, updateUserRole };
