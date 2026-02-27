const express = require('express');
const router = express.Router();
const { getStockQuote, getStockHistory, searchStocks } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

router.get('/quote/:symbol',    protect, getStockQuote);
router.get('/history/:symbol',  protect, getStockHistory);
router.get('/search/:keywords', protect, searchStocks);

module.exports = router;