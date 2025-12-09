/**
 * Monthly Summary Service
 * Handles sending monthly summary notifications
 */

import Email from "../models/Email";
import { createNotificationWithEmail } from "../controllers/notificationController";
import { getNotificationSettingsForUser } from "../controllers/notificationSettingsController";
import {
  sendEmailNotification,
  generateMonthlySummaryEmail,
} from "./emailService";

/**
 * Send monthly summary to a user
 */
export async function sendMonthlySummary(userId: string): Promise<void> {
  try {
    // Get user's notification preferences
    const settings = await getNotificationSettingsForUser(userId);

    // Only send if monthly summary is enabled
    if (!settings.monthlySummary) {
      console.log(`Monthly summary disabled for user: ${userId}`);
      return;
    }

    // Get all monitored emails for the user
    const emails = await Email.find({ userId });

    if (emails.length === 0) {
      console.log(`No emails to summarize for user: ${userId}`);
      return;
    }

    // Calculate statistics
    const totalEmails = emails.length;
    const safeEmails = emails.filter((e) => e.status === "safe").length;
    const breachedEmails = emails.filter((e) => e.status === "breached").length;
    const totalBreaches = emails.reduce((sum, e) => sum + (e.breaches || 0), 0);

    // Get current month and year for the report
    const now = new Date();
    const monthName = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Prepare email details for the report
    const emailDetails = emails.map((email) => {
      const emailDoc = email as any; // Type assertion for timestamps
      return {
        email: email.email,
        status: email.status,
        breaches: email.breaches || 0,
        lastChecked:
          email.lastChecked ||
          emailDoc.updatedAt ||
          emailDoc.createdAt ||
          new Date(),
      };
    });

    // Get user's email (assuming userId is the email)
    const userEmail = userId;

    // Send email notification if enabled (only emails, no website notifications)
    if (settings.emailNotifications && settings.monthlySummary) {
      const emailHtml = generateMonthlySummaryEmail(
        totalEmails,
        safeEmails,
        breachedEmails,
        totalBreaches,
        emailDetails,
        monthName
      );

      await sendEmailNotification({
        to: userEmail,
        subject: `Your ${monthName} Security Summary - BreachEye`,
        html: emailHtml,
      });
    }

    console.log(`✅ Monthly summary sent to user: ${userId}`);
  } catch (error) {
    console.error(`Error sending monthly summary to user ${userId}:`, error);
  }
}

/**
 * Send monthly summaries to all users (called by scheduler)
 */
export async function sendMonthlySummariesToAllUsers(): Promise<void> {
  try {
    // Get all unique user IDs
    const users = await Email.distinct("userId");

    console.log(`📊 Sending monthly summaries to ${users.length} users...`);

    // Send summary to each user (with some delay to avoid overwhelming the system)
    for (const userId of users) {
      await sendMonthlySummary(userId);
      // Small delay between users
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`✅ Monthly summaries sent to all users`);
  } catch (error) {
    console.error("Error sending monthly summaries:", error);
  }
}
