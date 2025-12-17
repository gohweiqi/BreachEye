/**
 * Notification Controller
 * Handles CRUD operations for user notifications
 */

import { Request, Response } from "express";
import Notification, { INotification } from "../models/Notification";
import { getNotificationSettingsForUser } from "./notificationSettingsController";
import {
  sendEmailNotification,
  generateBreachNotificationEmail,
} from "../services/emailService";

/**
 * Get all notifications for a user
 * GET /api/notifications
 */
export const getNotifications = async (
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

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Format time relative to now
    const formatTimeAgo = (date: Date): string => {
      const now = new Date();
      const diffInMs = now.getTime() - new Date(date).getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);

      if (diffInSeconds < 60) {
        return "just now";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} ${
          diffInMinutes === 1 ? "minute" : "minutes"
        } ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
      } else if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
      } else {
        return `${Math.floor(diffInDays / 30)} ${
          Math.floor(diffInDays / 30) === 1 ? "month" : "months"
        } ago`;
      }
    };

    res.status(200).json({
      success: true,
      notifications: notifications.map((notification) => ({
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: formatTimeAgo(notification.createdAt),
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
    });
  }
};

/**
 * Mark a notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    const notification = await Notification.findOne({
      _id: id,
      userId, // Ensure user can only update their own notifications
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        error: "Notification not found",
      });
      return;
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
      },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark notification as read",
    });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = async (
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

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark all notifications as read",
    });
  }
};

/**
 * Create a notification
 * POST /api/notifications
 */
export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;
    const { type, title, message } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    if (!type || !title || !message) {
      res.status(400).json({
        success: false,
        error: "Type, title, and message are required",
      });
      return;
    }

    if (!["breach", "summary", "security", "system"].includes(type)) {
      res.status(400).json({
        success: false,
        error:
          "Invalid notification type. Must be one of: breach, summary, security, system",
      });
      return;
    }

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      read: false,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create notification",
    });
  }
};

/**
 * Create a notification with optional email sending
 * This is used internally by other services
 */
export const createNotificationWithEmail = async (
  userId: string,
  type: "breach" | "summary" | "security" | "system",
  title: string,
  message: string,
  emailData?: {
    email: string;
    breachCount?: number;
    breachNames?: string[];
  }
): Promise<INotification | null> => {
  try {
    // Get user notification preferences
    const settings = await getNotificationSettingsForUser(userId);

    // Create notification record in database (for website notifications)
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      read: false,
    });
    await notification.save();

    // Send email notification if enabled (only for breach and summary types)
    // Always send to the signed-in Gmail (userId), not the monitored email
    console.log(`Email notification check for user: ${userId}`);
    console.log(`Email notifications enabled: ${settings.emailNotifications}`);

    if (
      settings.emailNotifications &&
      (type === "breach" || type === "summary")
    ) {
      try {
        // Use userId (signed-in email) as the recipient
        const recipientEmail = userId;
        console.log(`Sending email to: ${recipientEmail}`);

        if (
          type === "breach" &&
          emailData &&
          emailData.breachCount &&
          emailData.breachNames
        ) {
          // For breach notifications, show which monitored email was breached
          const monitoredEmail = emailData.email || "your monitored email";
          const emailHtml = generateBreachNotificationEmail(
            monitoredEmail,
            emailData.breachCount,
            emailData.breachNames
          );
          await sendEmailNotification({
            to: recipientEmail, // Send to signed-in Gmail
            subject: `Breach Alert: ${emailData.breachCount} breach${
              emailData.breachCount > 1 ? "es" : ""
            } detected`,
            html: emailHtml,
          });
        } else {
          // Generic notification email
          const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>${title}</h2>
                <p>${message}</p>
                <p><a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/dashboard">View Dashboard</a></p>
              </div>
            </body>
          </html>
        `;
          await sendEmailNotification({
            to: recipientEmail, // Send to signed-in Gmail
            subject: title,
            html: emailHtml,
          });
        }
      } catch (error) {
        console.error("Error sending email notification:", error);
        // Don't fail if email fails - notification is already saved
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    // Return null if notification creation fails
    return null;
  }
};
