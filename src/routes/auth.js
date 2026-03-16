const express = require('express');
const { register, login, adminLogin } = require('../controllers/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', upload.single('image'), register);
router.post('/login', login);
router.post('/admin-login', adminLogin);

module.exports = router;
