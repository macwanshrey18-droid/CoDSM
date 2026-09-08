const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getRequestStatus, 
  confirmWorker, 
  retryMatch, 
  cancelRequest 
} = require('../controllers/householdController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('household'), createRequest);
router.get('/:id', protect, authorize('household'), getRequestStatus);
router.post('/:id/confirm', protect, authorize('household'), confirmWorker);
router.post('/:id/retry', protect, authorize('household'), retryMatch);
router.post('/:id/cancel', protect, authorize('household'), cancelRequest);

module.exports = router;
