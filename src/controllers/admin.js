const User = require('../models/User');
const Saving = require('../models/Saving');

// @desc    Get all clients
// @route   GET /api/admin/clients
// @access  Private (Admin)
exports.getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' });

    const mappedClients = clients.map(client => ({
      id: client._id,
      name: client.fullName,
      image: client.profileImage,
      status: client.paymentStatus,
      joined: client.joinedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }));

    res.status(200).json(mappedClients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Deactivate client
// @route   PUT /api/admin/clients/:clientId/deactivate
// @access  Private (Admin)
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

// @desc    Get client receipts
// @route   GET /api/admin/clients/:clientId/receipts
// @access  Private (Admin)
exports.getClientReceipts = async (req, res) => {
  try {
    const receipts = await Saving.find({
      userId: req.params.clientId,
      receiptUrl: { $ne: null }
    });

    res.status(200).json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get client statement
// @route   GET /api/admin/clients/:clientId/statement
// @access  Private (Admin)
exports.getClientStatement = async (req, res) => {
  try {
    const transactions = await Saving.find({ userId: req.params.clientId }).sort({ date: 1 });

    let runningBalance = 0;
    const ledger = transactions.map(t => {
      runningBalance += t.amount;
      return {
        date: t.date,
        description: t.type,
        amount: t.amount,
        balance: runningBalance
      };
    });

    res.status(200).json(ledger);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
