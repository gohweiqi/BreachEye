/**
 * MongoDB Database Connection
 * Handles connection and disconnection to MongoDB
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// Also try loading .env.local
dotenv.config({ path: ".env.local", override: false });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/breacheye";

/**
 * Connect to MongoDB
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Mongoose already connected to MongoDB");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+, but kept for compatibility
    });

    console.log(`Host: localhost:27017`);
    console.log(`Database: breacheye`);
    console.log(`Connection String: ${MONGODB_URI}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDatabase();
  process.exit(0);
});
