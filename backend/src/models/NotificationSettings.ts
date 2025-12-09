/**
 * Notification Settings Model
 * Mongoose schema for user notification preferences
 */

import mongoose, { Document, Schema } from "mongoose";

export interface INotificationSettings extends Document {
  userId: string;
  websiteNotifications: boolean;
  emailNotifications: boolean;
  monthlySummary: boolean;
  securityUpdates: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingsSchema = new Schema<INotificationSettings>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    websiteNotifications: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    monthlySummary: {
      type: Boolean,
      default: false,
    },
    securityUpdates: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create model
const NotificationSettings = mongoose.model<INotificationSettings>(
  "NotificationSettings",
  NotificationSettingsSchema
);

export default NotificationSettings;


