const User = require('../models/User');
const Saving = require('../models/Saving');

// @desc    Get client dashboard (all savings)
// @route   GET /api/client/dashboard
// @access  Private (Client)
exports.getDashboard = async (req, res) => {
  try {
    const savings = await Saving.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      savings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Submit savings
// @route   POST /api/client/savings
// @access  Private (Client)
exports.submitSavings = async (req, res) => {
  try {
    const { amount, type } = req.body;
    const receiptUrl = req.file ? req.file.path : undefined;

    if (!receiptUrl) {
      return res.status(400).json({ message: 'Please upload a receipt' });
    }

    const saving = await Saving.create({
      userId: req.user.id,
      amount,
      type,
      receiptUrl
    });

    res.status(201).json({
      success: true,
      message: "Saving submitted successfully",
      data: saving
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
