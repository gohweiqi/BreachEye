/**
 * User Controller
 * Handles user account operations
 */

import { Request, Response } from "express";
import Email from "../models/Email";
import Notification from "../models/Notification";
import NotificationSettings from "../models/NotificationSettings";

/**
 * Get user account data
 * GET /api/user/account
 */
export const getUserAccountData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Try both lowercase and original case for header
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    // Get all emails for the user
    const emails = await Email.find({ userId }).sort({ addedDate: 1 });

    if (emails.length === 0) {
      // User has no emails yet, return default data
      res.status(200).json({
        success: true,
        data: {
          userId,
          joinedDate: new Date().toISOString(),
          accountStatus: "Active",
          monitoredEmails: 0,
          totalBreaches: 0,
        },
      });
      return;
    }

    // Calculate total breaches across all monitored emails
    const totalBreaches = emails.reduce(
      (sum, email) => sum + (email.breaches || 0),
      0
    );

    // Get the earliest added date (joined date)
    const joinedDate = emails[0].addedDate;

    res.status(200).json({
      success: true,
      data: {
        userId,
        joinedDate: joinedDate.toISOString(),
        accountStatus: "Active",
        monitoredEmails: emails.length,
        totalBreaches,
      },
    });
  } catch (error) {
    console.error("Error getting user account data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user account data",
    });
  }
};

/**
 * Delete user account and all associated data
 * DELETE /api/user/account
 */
export const deleteUserAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Try both lowercase and original case for header
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    // Delete all user data: Emails, Notifications, and NotificationSettings
    const [emailResult, notificationResult, settingsResult] = await Promise.all([
      Email.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      NotificationSettings.deleteOne({ userId }),
    ]);

    console.log(
      `Deleted account data for user: ${userId}`,
      {
        emails: emailResult.deletedCount,
        notifications: notificationResult.deletedCount,
        settings: settingsResult.deletedCount,
      }
    );

    res.status(200).json({
      success: true,
      message: "Account and all associated data deleted successfully",
      deletedCount: {
        emails: emailResult.deletedCount,
        notifications: notificationResult.deletedCount,
        settings: settingsResult.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user account",
    });
  }
};
