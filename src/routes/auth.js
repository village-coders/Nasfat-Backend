const express = require('express');
const { register, login, forgotPassword, verifyEmail } = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.get('/verifyemail/:token', verifyEmail);

module.exports = router;
