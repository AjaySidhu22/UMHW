const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUserRole } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');

// All routes below require admin role
router.use(protect, requireAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
