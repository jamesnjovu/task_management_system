const express = require('express');
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const validators = require('../utils/validators');

const router = express.Router();

// Public routes
router.post('/register', validate(validators.user.register), register);
router.post('/login', validate(validators.user.login), login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/password', protect, validate(validators.user.changePassword), changePassword);

module.exports = router;
