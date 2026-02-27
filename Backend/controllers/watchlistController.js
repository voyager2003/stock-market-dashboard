const User = require('../models/User');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Protected
const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('watchlist');
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add stock to watchlist
// @route   POST /api/watchlist/add
// @access  Protected
const addToWatchlist = async (req, res) => {
  const { symbol } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user.watchlist.includes(symbol.toUpperCase())) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }
    user.watchlist.push(symbol.toUpperCase());
    await user.save();
    res.json({ watchlist: user.watchlist, message: `${symbol} added to watchlist` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove stock from watchlist
// @route   DELETE /api/watchlist/remove/:symbol
// @access  Protected
const removeFromWatchlist = async (req, res) => {
  const { symbol } = req.params;
  try {
    const user = await User.findById(req.user._id);
    user.watchlist = user.watchlist.filter((s) => s !== symbol.toUpperCase());
    await user.save();
    res.json({ watchlist: user.watchlist, message: `${symbol} removed from watchlist` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };