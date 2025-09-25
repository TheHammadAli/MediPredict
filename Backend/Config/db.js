const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log(
      `[MongoDB] Attempting to connect to MongoDB with URI: ${process.env.MONGO_URI}`
    );
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    });
    console.log(`✅ [MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [MongoDB] Connection error: ${error.message}`);
    console.error(`[MongoDB] Error stack:`, error.stack);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log(`✅ [MongoDB] Mongoose connected to database`);
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ [MongoDB] Mongoose connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn(`⚠️ [MongoDB] Mongoose disconnected`);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log(`[MongoDB] Mongoose connection closed due to app termination`);
  process.exit(0);
});

module.exports = connectDB;
