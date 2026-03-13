const express = require('express');
const {
  submitContribution,
  getMyContributions,
  getAllContributions,
  updateContributionStatus
} = require('../controllers/contributions');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(upload.single('receipt'), submitContribution)
  .get(getMyContributions);

router.get('/admin', authorize('admin'), getAllContributions);
router.patch('/:id/verify', authorize('admin'), updateContributionStatus);

module.exports = router;
