const Contribution = require('../models/Contribution');

// @desc    Submit contribution
// @route   POST /api/contributions
// @access  Private (User)
exports.submitContribution = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a receipt' });
    }

    const contribution = await Contribution.create({
      user: req.user.id,
      amount: req.body.amount,
      receiptUrl: req.file.path,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: contribution
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user contributions
// @route   GET /api/contributions
// @access  Private (User)
exports.getMyContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: contributions.length,
      data: contributions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all contributions (Admin only)
// @route   GET /api/contributions/admin
// @access  Private (Admin)
exports.getAllContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find().populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: contributions.length,
      data: contributions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update contribution status (Admin only)
// @route   PATCH /api/contributions/:id/verify
// @access  Private (Admin)
exports.updateContributionStatus = async (req, res) => {
  try {
    let contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    const { status } = req.body;

    if (!['verified', 'paid'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    contribution = await Contribution.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: contribution
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
