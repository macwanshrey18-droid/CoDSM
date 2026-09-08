const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    }
  },
  requestedTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['matching', 'matched', 'no_match', 'cancelled'],
    default: 'matching',
  },
  matchedWorkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkerProfile',
    default: null,
  }
}, { timestamps: true });

serviceRequestSchema.index({ location: '2dsphere' });
serviceRequestSchema.index({ status: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
