const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URL is provided
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL environment variable is not defined. Please set it in your .env file or environment variables.');
    }

    await mongoose.connect(process.env.MONGO_URL, {
      // Modern connection options (useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+)
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Connected to: ${process.env.MONGO_URL.replace(/\/\/.*:.*@/, '//***:***@')}`); // Hide credentials in logs
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
