const User = require('../models/User');
const Saving = require('../models/Saving');

// @desc    Get all clients for admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboard = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).sort({ createdAt: -1 });

    res.status(200).json({
      clients,
      totalClients: clients.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get client savings
// @route   GET /api/admin/client/:id/savings
// @access  Private (Admin)
exports.getClientSavings = async (req, res) => {
  try {
    const savings = await Saving.find({ userId: req.params.id }).sort({ createdAt: -1 });

    res.status(200).json({
      savings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify saving (mark as paid)
// @route   PUT /api/admin/verify-saving/:id
// @access  Private (Admin)
exports.verifySaving = async (req, res) => {
  try {
    const saving = await Saving.findByIdAndUpdate(
      req.params.id,
      { status: 'paid' },
      { new: true }
    );

    if (!saving) {
      return res.status(404).json({ message: 'Saving not found' });
    }

    // Update user status as well
    await User.findByIdAndUpdate(saving.userId, { status: 'paid' });

    res.status(200).json(saving);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Deactivate client (Legacy support, optional)
exports.deactivateClient = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.clientId,
      { status: 'inactive' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
