const express = require('express');
const { register, login } = require('../controllers/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', upload.single('image'), register);
router.post('/login', login);

module.exports = router;
