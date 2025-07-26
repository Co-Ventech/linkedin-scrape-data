// database.js

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URL;
  console.log("🔍 MONGO_URL =", mongoURI); // Debugging line

  if (!mongoURI) {
    console.error('❌ MONGO_URL is missing from environment variables!');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI, {}); // Single connection call
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
