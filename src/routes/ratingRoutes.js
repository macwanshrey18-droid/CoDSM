const express = require('express');
const router = express.Router();
const { submitRating } = require('../controllers/ratingController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('household'), submitRating);

module.exports = router;
