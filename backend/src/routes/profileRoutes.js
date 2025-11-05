const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getPublicProfile } = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');
const validateProfile = require('../middlewares/validateProfile');  // ✅ added

router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateProfile, updateProfile);  // ✅ middleware added
router.get('/public-profile', getPublicProfile);

module.exports = router;
