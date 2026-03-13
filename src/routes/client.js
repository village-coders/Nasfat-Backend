const express = require('express');
const { getDashboard, submitSavings, updateSavingsMode } = require('../controllers/client');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('client'));

router.get('/dashboard', getDashboard);
router.post('/savings', upload.single('receipt'), submitSavings);
router.put('/savings-mode', updateSavingsMode);

module.exports = router;
