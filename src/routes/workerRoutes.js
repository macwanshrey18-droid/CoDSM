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
const { protect } = require('../middlewares/auth');

// Private worker routes (authenticated via JWT session token)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/availability', protect, updateAvailability);
router.get('/requests', protect, getRequests);
router.post('/requests/:id/accept', protect, acceptRequest);
router.post('/requests/:id/decline', protect, declineRequest);
router.post('/requests/:id/complete', protect, completeRequest);
router.get('/earnings', protect, getWorkerEarnings);

// Public read-only lookups
router.get('/:id/ratings', protect, getWorkerRatings);

module.exports = router;
