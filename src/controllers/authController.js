const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../services/emailService');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: userId, role, tokenVersion: 1 },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      try {
        user = await User.create({ email: normalizedEmail, role });
      } catch (createErr) {
        if (createErr.code === 11000 && (createErr.message.includes('phone') || createErr.keyPattern?.phone)) {
          await User.collection.dropIndex('phone_1').catch(() => {});
          user = await User.create({ email: normalizedEmail, role });
        } else {
          throw createErr;
        }
      }
    } else {
      user.role = role;
      await user.save();
    }

    res.status(200).json({ message: 'User registered/found successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Delete previous OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail });

    // 2. Generate random 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Save to MongoDB Otp collection
    await Otp.create({
      email: normalizedEmail,
      otp: generatedOtp,
      expiresAt,
    });

    // 4. Dispatch Email
    await sendOtpEmail(normalizedEmail, generatedOtp);

    res.status(200).json({ message: `OTP code sent to ${normalizedEmail}`, otp: generatedOtp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email address and 6-digit OTP code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // 1. Strict Query against MongoDB Otp collection OR Universal Demo OTP 123456
    const otpRecord = await Otp.findOne({ email: normalizedEmail, otp: cleanOtp });
    
    if (!otpRecord && cleanOtp !== '123456') {
      return res.status(400).json({ error: 'Invalid OTP code. Please check your email and try again.' });
    }

    if (otpRecord && otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      if (cleanOtp !== '123456') {
        return res.status(400).json({ error: 'OTP code has expired. Please request a new OTP.' });
      }
    }

    // Delete used OTP
    await Otp.deleteMany({ email: normalizedEmail });

    // 2. Find or Create User
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      try {
        user = await User.create({ email: normalizedEmail, role: req.body.role || 'household' });
      } catch (createErr) {
        if (createErr.code === 11000 && (createErr.message.includes('phone') || createErr.keyPattern?.phone)) {
          await User.collection.dropIndex('phone_1').catch(() => {});
          user = await User.create({ email: normalizedEmail, role: req.body.role || 'household' });
        } else {
          throw createErr;
        }
      }
    }

    user.isVerified = true;
    
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({ 
      accessToken, 
      refreshToken, 
      user: { _id: user._id, role: user.role, email: user.email, name: user.name, phone: user.phone, address: user.address } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -refreshTokens');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();
    res.status(200).json({ _id: user._id, email: user.email, role: user.role, name: user.name, phone: user.phone, address: user.address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    const user = await User.findById(decoded.sub);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id, user.role);
    
    user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json(tokens);
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
        await user.save();
      }
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userEmail = user.email;

    // Delete User record
    await User.findByIdAndDelete(userId);

    // Delete associated Worker profile if applicable
    const Worker = require('../models/Worker');
    await Worker.findOneAndDelete({ user: userId }).catch(() => {});

    // Delete any active OTP records
    await Otp.deleteMany({ email: userEmail }).catch(() => {});

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
