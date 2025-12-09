/**
 * Monthly Summary Controller
 * Handles fetching monthly summary data for users
 */

import { Request, Response } from "express";
import Email from "../models/Email";

/**
 * Get monthly summary data for a user
 * GET /api/monthly-summary?year=2024&month=12
 */
export const getMonthlySummary = async (
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

    // Get year and month from query params (default to current month)
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month =
      parseInt(req.query.month as string) || new Date().getMonth() + 1;

    // Validate month (1-12)
    if (month < 1 || month > 12) {
      res.status(400).json({
        success: false,
        error: "Invalid month. Must be between 1 and 12.",
      });
      return;
    }

    // Validate year (current year or past 12 months)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const minYear = currentYear - 1; // Allow past 12 months

    if (year < minYear || year > currentYear) {
      res.status(400).json({
        success: false,
        error: "Invalid year. Can only view past 12 months.",
      });
      return;
    }

    // If viewing future month, return empty data
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      res.status(200).json({
        success: true,
        summary: {
          totalEmails: 0,
          safeEmails: 0,
          breachedEmails: 0,
          totalBreaches: 0,
          emails: [],
          month,
          year,
        },
      });
      return;
    }

    // Get all monitored emails for the user
    // For current month, show all emails
    // For past months, show emails that existed during that month (added before or during that month)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    let emails;
    if (year === currentYear && month === currentMonth) {
      // Current month: show all emails
      emails = await Email.find({ userId }).lean();
    } else {
      // Past month: show emails that were added before or during that month
      emails = await Email.find({
        userId,
        addedDate: { $lte: endDate },
      }).lean();
    }

    if (emails.length === 0) {
      res.status(200).json({
        success: true,
        summary: {
          totalEmails: 0,
          safeEmails: 0,
          breachedEmails: 0,
          totalBreaches: 0,
          emails: [],
        },
      });
      return;
    }

    // Calculate statistics
    const totalEmails = emails.length;
    const safeEmails = emails.filter((e) => e.status === "safe").length;
    const breachedEmails = emails.filter((e) => e.status === "breached").length;
    const totalBreaches = emails.reduce((sum, e) => sum + (e.breaches || 0), 0);

    // Get detailed email information
    const emailDetails = emails.map((email) => ({
      email: email.email,
      status: email.status,
      breaches: email.breaches || 0,
      lastChecked:
        email.updatedAt?.toISOString() || email.createdAt?.toISOString(),
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalEmails,
        safeEmails,
        breachedEmails,
        totalBreaches,
        emails: emailDetails,
        month,
        year,
      },
    });
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch monthly summary",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
