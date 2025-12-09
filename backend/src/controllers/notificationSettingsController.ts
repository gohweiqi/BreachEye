/**
 * Notification Settings Controller
 * Handles user notification preferences
 */

import { Request, Response } from "express";
import NotificationSettings from "../models/NotificationSettings";

/**
 * Get notification settings for a user
 * GET /api/notification-settings
 */
export const getNotificationSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    let settings = await NotificationSettings.findOne({ userId });

    // If no settings exist, create default settings
    if (!settings) {
      settings = new NotificationSettings({
        userId,
        websiteNotifications: true,
        emailNotifications: true,
        monthlySummary: false,
        securityUpdates: true,
      });
      await settings.save();
    }

    res.status(200).json({
      success: true,
      settings: {
        websiteNotifications: settings.websiteNotifications,
        emailNotifications: settings.emailNotifications,
        monthlySummary: settings.monthlySummary,
        securityUpdates: settings.securityUpdates,
      },
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notification settings",
    });
  }
};

/**
 * Update notification settings
 * PUT /api/notification-settings
 */
export const updateNotificationSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;
    const {
      websiteNotifications,
      emailNotifications,
      monthlySummary,
      securityUpdates,
    } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    const settings = await NotificationSettings.findOneAndUpdate(
      { userId },
      {
        websiteNotifications:
          websiteNotifications !== undefined ? websiteNotifications : true,
        emailNotifications:
          emailNotifications !== undefined ? emailNotifications : true,
        monthlySummary: monthlySummary !== undefined ? monthlySummary : false,
        securityUpdates: securityUpdates !== undefined ? securityUpdates : true,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      settings: {
        websiteNotifications: settings.websiteNotifications,
        emailNotifications: settings.emailNotifications,
        monthlySummary: settings.monthlySummary,
        securityUpdates: settings.securityUpdates,
      },
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update notification settings",
    });
  }
};

/**
 * Get notification settings (helper function for other services)
 */
export const getNotificationSettingsForUser = async (
  userId: string
): Promise<{
  websiteNotifications: boolean;
  emailNotifications: boolean;
  monthlySummary: boolean;
  securityUpdates: boolean;
}> => {
  let settings = await NotificationSettings.findOne({ userId });

  if (!settings) {
    // Return defaults if no settings exist
    return {
      websiteNotifications: true,
      emailNotifications: true,
      monthlySummary: false,
      securityUpdates: true,
    };
  }

  return {
    websiteNotifications: settings.websiteNotifications,
    emailNotifications: settings.emailNotifications,
    monthlySummary: settings.monthlySummary,
    securityUpdates: settings.securityUpdates,
  };
};
