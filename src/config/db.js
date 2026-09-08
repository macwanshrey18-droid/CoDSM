const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop stale/legacy unique index 'phone_1' from users collection if present
    try {
      await conn.connection.collection('users').dropIndex('phone_1');
      console.log("Legacy 'phone_1' unique index dropped from MongoDB users collection.");
    } catch (indexErr) {
      // Index phone_1 does not exist or already dropped - safe to ignore
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
