const mongoose = require('mongoose');

const savingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  receiptUrl: {
    type: String
  },
  type: {
    type: String,
    default: 'Monthly Deposit'
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Saving', savingSchema);
