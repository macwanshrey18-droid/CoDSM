const express = require('express');
const router = express.Router();
const { register, sendOtp, verifyOtp, refresh, logout, getMe, updateProfile, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);
router.post('/logout', protect, logout);

module.exports = router;
