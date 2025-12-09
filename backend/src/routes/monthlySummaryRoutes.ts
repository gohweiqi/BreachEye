/**
 * Monthly Summary Routes
 * API routes for monthly summary
 */

import { Router } from "express";
import { sendMonthlySummary } from "../services/monthlySummaryService";
import { getMonthlySummary } from "../controllers/monthlySummaryController";
import { triggerMonthlySummaries } from "../services/monthlySummaryScheduler";

const router = Router();

/**
 * Get monthly summary data for a user
 * GET /api/monthly-summary
 */
router.get("/", getMonthlySummary);

/**
 * Trigger monthly summary email for a user (for testing)
 * POST /api/monthly-summary/trigger
 */
router.post("/trigger", async (req, res) => {
  try {
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    await sendMonthlySummary(userId);

    res.status(200).json({
      success: true,
      message: "Monthly summary sent successfully",
    });
  } catch (error) {
    console.error("Error triggering monthly summary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send monthly summary",
    });
  }
});

/**
 * Manually trigger monthly summaries for all users (for testing/admin)
 * POST /api/monthly-summary/trigger-all
 */
router.post("/trigger-all", async (req, res) => {
  try {
    await triggerMonthlySummaries();

    res.status(200).json({
      success: true,
      message: "Monthly summaries triggered for all users",
    });
  } catch (error) {
    console.error("Error triggering monthly summaries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to trigger monthly summaries",
    });
  }
});

export default router;
