const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true,
  },
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkerProfile',
    required: true,
  },
  status: {
    type: String,
    enum: ['matched', 'accepted', 'declined', 'in_progress', 'completed'],
    default: 'matched',
  },
  isRated: {
    type: Boolean,
    default: false,
  },
  matchScore: {
    type: Number,
  },
  timestamps: {
    matchedAt: { type: Date, default: Date.now },
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
  }
}, { timestamps: true });

bookingSchema.index({ workerId: 1, status: 1 });
bookingSchema.index({ householdId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
