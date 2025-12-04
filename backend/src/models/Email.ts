/**
 * Email Model
 * Mongoose schema for monitored email addresses
 */

import mongoose, { Document, Schema } from "mongoose";

export interface IEmail extends Document {
  userId: string;
  email: string;
  status: "safe" | "breached";
  breaches: number;
  addedDate: Date;
  lastChecked?: Date;
  breachData?: any; // Store full breach analytics data
}

const EmailSchema = new Schema<IEmail>(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Index for faster queries
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["safe", "breached"],
      default: "safe",
    },
    breaches: {
      type: Number,
      default: 0,
    },
    addedDate: {
      type: Date,
      default: Date.now,
    },
    lastChecked: {
      type: Date,
    },
    breachData: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Compound index to ensure one email per user
EmailSchema.index({ userId: 1, email: 1 }, { unique: true });

// Create model
const Email = mongoose.model<IEmail>("Email", EmailSchema);

export default Email;
