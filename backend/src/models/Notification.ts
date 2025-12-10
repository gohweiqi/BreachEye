/**
 * Notification Model
 * Mongoose schema for user notifications
 */

import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: string;
  type: "breach" | "summary" | "security" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Index for faster queries
    },
    type: {
      type: String,
      enum: ["breach", "summary", "security", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Compound index for faster queries by user and read status
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Create model
const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default Notification;
