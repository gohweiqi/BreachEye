/**
 * MongoDB Database Connection
 * Handles connection and disconnection to MongoDB
 * Optimized for MongoDB Atlas and serverless environments (Vercel)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// Also try loading .env.local
dotenv.config({ path: ".env.local", override: false });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Please set it in your environment variables."
  );
}

/**
 * Connect to MongoDB
 * Optimized for MongoDB Atlas and serverless environments
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("Mongoose already connected to MongoDB");
      return;
    }

    // Connection options optimized for MongoDB Atlas and serverless (Vercel)
    const options = {
      // Server selection timeout (how long to wait for server selection)
      serverSelectionTimeoutMS: 5000, // 5 seconds
      // Socket timeout (how long to wait for a response)
      socketTimeoutMS: 45000, // 45 seconds
      // Connection timeout
      connectTimeoutMS: 10000, // 10 seconds
      // Maximum number of connections in the connection pool
      maxPoolSize: 10,
      // Minimum number of connections in the connection pool
      minPoolSize: 1,
      // How long a connection can remain idle before being closed
      maxIdleTimeMS: 30000, // 30 seconds
      // Retry connection on failure
      retryWrites: true,
      // SSL/TLS is automatically handled by Mongoose 6+ for Atlas connections
    };

    await mongoose.connect(MONGODB_URI, options);

    console.log("Successfully connected to MongoDB Atlas");
    console.log(
      `Database: ${mongoose.connection.db?.databaseName || "breacheye"}`
    );
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
