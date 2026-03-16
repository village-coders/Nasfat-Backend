const express = require('express');
const { register, login, adminLogin, verifyOTP, resendOTP, forgotPassword, resetPassword } = require('../controllers/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', upload.single('image'), register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

module.exports = router;
