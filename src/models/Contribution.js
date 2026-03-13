const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  receiptUrl: {
    type: String,
    required: [true, 'Please upload a receipt']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'paid'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contribution', contributionSchema);
