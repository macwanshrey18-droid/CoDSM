const express = require('express');
const router = express.Router();
const { 
  getProfile,
  updateProfile, 
  updateAvailability, 
  getRequests, 
  acceptRequest, 
  declineRequest, 
  completeRequest,
  getWorkerRatings,
  getWorkerEarnings
} = require('../controllers/workerController');
const { protect, authorize } = require('../middlewares/auth');

// Private worker routes
router.get('/profile', protect, authorize('worker'), getProfile);
router.put('/profile', protect, authorize('worker'), updateProfile);
router.put('/availability', protect, authorize('worker'), updateAvailability);
router.get('/requests', protect, authorize('worker'), getRequests);
router.post('/requests/:id/accept', protect, authorize('worker'), acceptRequest);
router.post('/requests/:id/decline', protect, authorize('worker'), declineRequest);
router.post('/requests/:id/complete', protect, authorize('worker'), completeRequest);
router.get('/earnings', protect, authorize('worker'), getWorkerEarnings);

// Public read-only lookups
router.get('/:id/ratings', protect, getWorkerRatings);

module.exports = router;
