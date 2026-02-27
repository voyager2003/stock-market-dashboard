const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username:  { type: String, required: true },
    symbol:    { type: String, required: true, uppercase: true },
    type:      { type: String, enum: ['buy', 'sell'], required: true },
    quantity:  { type: Number, required: true, min: 1 },
    price:     { type: Number, required: true },
    total:     { type: Number, required: true },
    status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);