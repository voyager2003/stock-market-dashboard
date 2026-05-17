const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Submit a buy/sell request
// @route   POST /api/transactions
// @access  Protected
const createTransaction = async (req, res) => {
  const { symbol, type, quantity, price } = req.body;
  try {
    const total = quantity * price;
    const user = await User.findById(req.user._id);
    
    // Check balance for buy orders
    if (type === 'buy' && user.balance < total) {
      return res.status(400).json({ message: 'Insufficient balance for this purchase' });
    }

    // Create and auto-approve transaction
    const transaction = await Transaction.create({
      user:     req.user._id,
      username: req.user.username,
      symbol:   symbol.toUpperCase(),
      type,
      quantity,
      price,
      total,
      status: 'approved',  // Auto-approve instead of pending
    });

    // Update user balance immediately
    if (type === 'buy') {
      user.balance -= total;  // deduct for buy
    } else {
      user.balance += total;  // credit for sell
    }
    await user.save();

    res.status(201).json({ transaction, balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's own transactions
// @route   GET /api/transactions/my
// @access  Protected
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ALL transactions (admin)
// @route   GET /api/transactions/all
// @access  Admin
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin approves or rejects a transaction
// @route   PUT /api/transactions/:id/status
// @access  Admin
const updateTransactionStatus = async (req, res) => {
  const { status, adminNote } = req.body;
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.status    = status;
    transaction.adminNote = adminNote || '';

    // Update user balance when admin approves
    if (status === 'approved') {
      const user = await User.findById(transaction.user);
      if (transaction.type === 'buy') {
        if (user.balance < transaction.total) {
          return res.status(400).json({ message: 'User has insufficient balance' });
        }
        user.balance -= transaction.total;  // deduct for buy
      } else {
        user.balance += transaction.total;  // credit for sell
      }
      await user.save();
    }

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTransaction, getMyTransactions, getAllTransactions, updateTransactionStatus };