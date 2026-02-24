const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/codeIDE";
    console.log("🔌 [DB] Connecting to MongoDB...");
    console.log("🔌 [DB] URI starts with:", mongoURI.substring(0, 20) + "...");

    await mongoose.connect(mongoURI);
    console.log("[DB] MongoDB connected successfully");
  } catch (error) {
    console.error(" [DB] MongoDB connection error:", error.message);
    // Don't exit process on Vercel - let the app handle errors gracefully
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
