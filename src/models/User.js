const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['household', 'worker'],
    required: true,
  },
  passwordHash: {
    type: String,
    // Unused in OTP prototype
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  refreshTokens: [{
    type: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
