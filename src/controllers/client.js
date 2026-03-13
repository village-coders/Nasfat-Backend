const User = require('../models/User');
const Saving = require('../models/Saving');

// @desc    Get client dashboard stats
// @route   GET /api/client/dashboard
// @access  Private (Client)
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const savings = await Saving.find({ userId: req.user.id });
    
    const totalAmountSaved = savings.reduce((acc, curr) => acc + curr.amount, 0);
    const amountSavedThisMonth = savings
      .filter(s => s.date >= firstDayOfMonth)
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      amountSavedThisMonth,
      totalAmountSaved,
      user: req.user
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
    const { amount } = req.body;
    const receiptUrl = req.file ? req.file.path : undefined;

    const saving = await Saving.create({
      userId: req.user.id,
      amount,
      receiptUrl,
      type: `${req.user.paymentFrequency.charAt(0).toUpperCase() + req.user.paymentFrequency.slice(1)} Deposit`
    });

    res.status(201).json({
      success: true,
      data: saving
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update savings mode
// @route   PUT /api/client/savings-mode
// @access  Private (Client)
exports.updateSavingsMode = async (req, res) => {
  try {
    const { mode } = req.body;

    if (!['weekly', 'monthly'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid savings mode' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { paymentFrequency: mode },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
