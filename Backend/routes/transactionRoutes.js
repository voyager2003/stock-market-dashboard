const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getMyTransactions,
  getAllTransactions,
  updateTransactionStatus,
} = require('../controllers/transactionController');
const { protect }    = require('../middleware/authMiddleware');
const { adminOnly }  = require('../middleware/adminMiddleware');

router.post('/',              protect,             createTransaction);
router.get('/my',             protect,             getMyTransactions);
router.get('/all',            protect, adminOnly,  getAllTransactions);
router.put('/:id/status',     protect, adminOnly,  updateTransactionStatus);

module.exports = router;