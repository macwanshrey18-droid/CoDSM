const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String, // Worker's permanent mobile contact number
  },
  photoUrl: {
    type: String,
    required: true,
  },
  skills: [{
    type: String,
  }],
  certifications: [{
    docUrl: String,
    verified: {
      type: Boolean,
      default: false,
    },
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'unavailable',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  currentActiveJobs: {
    type: Number,
    default: 0,
  },
  jobsCompleted: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  ratingAvg: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

workerProfileSchema.index({ location: '2dsphere' });
workerProfileSchema.index({ skills: 1 });
workerProfileSchema.index({ 'availability.status': 1 });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
