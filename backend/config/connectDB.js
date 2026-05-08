const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect to remote Atlas with optimized connection parameters
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // 15s wait to survive Railway cold starts
      maxPoolSize: 50, // Optimize database concurrency
      socketTimeoutMS: 45000, 
    });
    console.log("✅ MongoDB connected successfully to remote cluster.");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    // Never fallback to Memory DB in production, let it fail so Railway restarts the container
    process.exit(1); 
  }
};

module.exports = connectDB;
