const express = require('express');
const { getDashboard, submitSavings } = require('../controllers/client');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.post('/savings', protect, upload.single('receipt'), submitSavings);

module.exports = router;
