require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const WorkerProfile = require('../src/models/WorkerProfile');
const ServiceRequest = require('../src/models/ServiceRequest');
const Booking = require('../src/models/Booking');
const Rating = require('../src/models/Rating');

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://shrey18052008_db_user:EqlKGq5vFNzaM2K4@cluster0.5sk3toi.mongodb.net/codsm';

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    const email = 'service@gmail.com';

    // 1. Find or Create User for service@gmail.com
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: 'Arjun Kumar',
        phone: '9876543210',
        address: 'Navrangpura, Ahmedabad',
        role: 'worker',
        isVerified: true,
      });
    } else {
      user.name = 'Arjun Kumar';
      user.phone = '9876543210';
      user.address = 'Navrangpura, Ahmedabad';
      user.role = 'worker';
      user.isVerified = true;
      await user.save();
    }

    console.log('Worker User Updated/Created:', user._id);

    // 2. Find or Create WorkerProfile
    let profile = await WorkerProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new WorkerProfile({ userId: user._id });
    }

    profile.name = 'Arjun Kumar';
    profile.phone = '9876543210';
    profile.photoUrl = 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200';
    profile.skills = ['plumbing', 'electrical', 'appliance'];
    profile.location = { type: 'Point', coordinates: [72.5714, 23.0225] };
    profile.availability = { status: 'available', updatedAt: new Date() };
    profile.jobsCompleted = 14;
    profile.totalEarnings = 12400;
    profile.ratingAvg = 4.9;
    profile.ratingCount = 14;

    await profile.save();
    console.log('Worker Profile Updated/Created:', profile._id);

    // 3. Clear previous bookings and create 4 rich completed bookings & ratings
    await Booking.deleteMany({ workerId: profile._id });

    const sampleRequestsData = [
      { category: 'plumbing', amount: 950, rating: 5, comment: 'Fixed high-pressure pipe leak in less than 30 mins! Extremely professional.' },
      { category: 'electrical', amount: 1400, rating: 5, comment: 'Installed main circuit breaker flawlessly. Certified expert skill!' },
      { category: 'appliance', amount: 1200, rating: 5, comment: 'Replaced AC capacitor quickly with full transparent cooperative pricing.' },
      { category: 'plumbing', amount: 850, rating: 4, comment: 'Punctual, clean work, and polite demeanor. Highly recommended.' },
    ];

    for (const item of sampleRequestsData) {
      const sr = await ServiceRequest.create({
        householdId: user._id,
        category: item.category,
        location: { type: 'Point', coordinates: [72.5714, 23.0225] },
        requestedTime: new Date(Date.now() - Math.floor(Math.random() * 5 * 86400000)),
        status: 'matched',
        matchedWorkerId: profile._id,
      });

      const booking = await Booking.create({
        serviceRequestId: sr._id,
        householdId: user._id,
        workerId: profile._id,
        status: 'completed',
        isRated: true,
        matchScore: 98,
        timestamps: {
          matchedAt: new Date(Date.now() - 86400000),
          acceptedAt: new Date(Date.now() - 80000000),
          startedAt: new Date(Date.now() - 70000000),
          completedAt: new Date(Date.now() - 60000000),
        },
      });

      await Rating.create({
        bookingId: booking._id,
        householdId: user._id,
        workerId: profile._id,
        stars: item.rating,
        comment: item.comment,
      });
    }

    console.log('Successfully seeded 4 completed bookings and ratings for service@gmail.com!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seed();
