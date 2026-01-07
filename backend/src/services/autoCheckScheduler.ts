/**
 * Auto Check Scheduler
 * Automatically checks all emails for breaches on a scheduled basis
 */

import cron from "node-cron";
import { checkAllEmailsForBreaches } from "./autoCheckService";

/**
 * Initialize the auto-check scheduler
 *
 * Default schedule: Runs every minute
 * Set ENABLE_TEST_MODE=true in .env to run every hour for testing
 * Set AUTO_CHECK_INTERVAL_HOURS=X in .env to customize interval (in hours)
 */
export function initializeAutoCheckScheduler(): void {
  console.log("Auto Check Scheduler initialized");

  // Check if test mode is enabled (for development/testing)
  const testMode = process.env.ENABLE_TEST_MODE === "true";

  // Get custom interval from environment variable (in hours)
  const customIntervalHours = parseInt(
    process.env.AUTO_CHECK_INTERVAL_HOURS || "0",
    10
  );

  let cronSchedule: string;

  if (testMode) {
    // Test mode: run every hour
    cronSchedule = "0 * * * *";
    console.log("TEST MODE ENABLED: Auto-check scheduler will run every hour");
    console.log("Remember to disable test mode in production!");
  } else if (customIntervalHours > 0) {
    // Custom interval: run every X hours
    if (customIntervalHours < 1 || customIntervalHours > 23) {
      console.warn(
        `Invalid AUTO_CHECK_INTERVAL_HOURS value: ${customIntervalHours}. Must be between 1-23. Using default (every minute).`
      );
      cronSchedule = "* * * * *"; // Default: every minute
    } else {
      cronSchedule = `0 */${customIntervalHours} * * *`;
      console.log(
        `Custom interval enabled: Auto-check will run every ${customIntervalHours} hour(s)`
      );
    }
  } else {
    // Default: every minute
    cronSchedule = "* * * * *";
    console.log("Auto-check scheduler will run every minute");
  }

  cron.schedule(cronSchedule, async () => {
    try {
      if (testMode) {
        console.log(`TEST MODE: Running auto-check for all emails...`);
      } else {
        console.log(
          `[${new Date().toISOString()}] Scheduled auto-check: Checking all emails for breaches...`
        );
      }
      await checkAllEmailsForBreaches();
    } catch (error) {
      console.error("Error in auto-check scheduler:", error);
    }
  });

  console.log(`Cron schedule: ${cronSchedule}`);
}

/**
 * Manually trigger auto-check (for testing)
 */
export async function triggerAutoCheck(): Promise<void> {
  console.log("Manually triggering auto-check for all emails...");
  await checkAllEmailsForBreaches();
}
