// \backend\src\routes\shareRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
    generateShareToken,
    getRecordsByShareToken,
    listShareTokens,
    revokeShareToken
} = require('../controllers/shareController');


// 1. Route to Generate a Share Token (Accessible by Patient only)
router.post(
    '/',
    protect,
    [
        body('duration').isString().notEmpty().withMessage('Sharing duration is required.'),
        body('sharedWithEmail').optional().isEmail().withMessage('Must be a valid email address.')
    ],
    validate,
    generateShareToken
);

// 2. Routes for Token Management (Patient only) - **MUST BE BEFORE /:token**
router.get('/manage', protect, listShareTokens);
router.delete('/manage/:tokenId', protect, revokeShareToken);

// 3. Route to Fetch Records using the Share Token (Public access) - **MOVED TO THE END**
router.get('/:token', getRecordsByShareToken); 

module.exports = router;