const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  getUsers,
  signupValidation,
  loginValidation,
} = require('../controllers/authController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Admin'), getUsers);

module.exports = router;
