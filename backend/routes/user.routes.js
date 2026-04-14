const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, changePassword } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/:id/profile', getUserProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

module.exports = router;
