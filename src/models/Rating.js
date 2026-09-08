const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkerProfile',
    required: true,
  },
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
  }
}, { timestamps: true });

ratingSchema.index({ workerId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
