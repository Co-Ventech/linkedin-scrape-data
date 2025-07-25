const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URL;
  console.log("here is the mongo url :", mongoURI);
  
  try {
    await mongoose.connect(mongoURI, {
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
