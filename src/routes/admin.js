const express = require('express');
const { getDashboard, getClientSavings } = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/client/:id/savings', getClientSavings);

module.exports = router;
