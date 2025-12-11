/**
 * Monthly Summary Scheduler
 * Automatically sends monthly summary emails on the last day of each month
 */

import cron from "node-cron";
import { sendMonthlySummariesToAllUsers } from "./monthlySummaryService";

/**
 * Check if today is the last day of the month
 */
function isLastDayOfMonth(): boolean {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // If tomorrow is the 1st, today is the last day of the month
  return tomorrow.getDate() === 1;
}

/**
 * Initialize the monthly summary scheduler
 * Runs daily at 11:00 PM to check if it's the last day of the month
 *
 * Set ENABLE_TEST_MODE=true in .env to run every minute for testing
 */
export function initializeMonthlySummaryScheduler(): void {
  console.log("Monthly Summary Scheduler initialized");

  // Check if test mode is enabled (for development/testing)
  const testMode = process.env.ENABLE_TEST_MODE === "true";

  // Schedule: Run daily at 11:00 PM, or every minute in test mode
  const cronSchedule = testMode ? "* * * * *" : "0 23 * * *";

  if (testMode) {
    console.log("TEST MODE ENABLED: Scheduler will run every minute");
    console.log("Remember to disable test mode in production!");
  }

  cron.schedule(cronSchedule, async () => {
    try {
      if (isLastDayOfMonth() || testMode) {
        if (testMode) {
          console.log(`TEST MODE: Sending monthly summaries to all users...`);
        } else {
          console.log(
            `Last day of month detected. Sending monthly summaries to all users...`
          );
        }
        await sendMonthlySummariesToAllUsers();
      } else {
        console.log(`Not the last day of the month. Skipping monthly summary.`);
      }
    } catch (error) {
      console.error("Error in monthly summary scheduler:", error);
    }
  });

  if (!testMode) {
    console.log(
      "Monthly Summary Scheduler will run daily at 11:00 PM to check for last day of month"
    );
  }
}

/**
 * Manually trigger monthly summaries (for testing)
 */
export async function triggerMonthlySummaries(): Promise<void> {
  console.log("Manually triggering monthly summaries...");
  await sendMonthlySummariesToAllUsers();
}
