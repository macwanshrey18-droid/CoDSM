const Rating = require('../models/Rating');
const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');

exports.submitRating = async (req, res) => {
  try {
    const { workerId, bookingId, stars, comment } = req.body;
    
    // Check if booking belongs to user and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    if (booking.householdId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed bookings' });
    }

    if (booking.isRated) {
      return res.status(400).json({ error: 'Booking already rated' });
    }

    const rating = new Rating({
      bookingId,
      workerId,
      householdId: req.user._id,
      stars,
      comment
    });
    
    await rating.save();
    
    booking.isRated = true;
    await booking.save();
    
    // Recompute worker's average rating
    const workerProfile = await WorkerProfile.findById(workerId);
    if (workerProfile) {
      const newCount = workerProfile.ratingCount + 1;
      const newAvg = ((workerProfile.ratingAvg * workerProfile.ratingCount) + stars) / newCount;
      workerProfile.ratingCount = newCount;
      workerProfile.ratingAvg = newAvg;
      await workerProfile.save();
    }

    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
