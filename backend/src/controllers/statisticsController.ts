import { Request, Response } from "express";
import { BreachStatisticsService } from "../services/breachStatisticsService";

/**
 * Controller for handling statistics-related requests
 */
export class StatisticsController {
  /**
   * Get global breach statistics
   * GET /api/statistics
   */
  static async getGlobalStatistics(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const statistics = await BreachStatisticsService.getGlobalStatistics();

      // Format the response with proper year data for the chart
      const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
      const formattedBreachesByYear: Record<string, number> = {};

      years.forEach((year) => {
        formattedBreachesByYear[year] = statistics.breachesByYear[year] || 0;
      });

      res.status(200).json({
        success: true,
        data: {
          compromisedWebsites: statistics.compromisedWebsites,
          breachedAccounts: statistics.breachedAccounts,
          breachesByYear: formattedBreachesByYear,
        },
      });
    } catch (error) {
      console.error("Error in statistics controller:", error);
      // Return fallback values if there's an error
      const fallback = await BreachStatisticsService.getGlobalStatistics();
      res.status(200).json({
        success: true,
        data: {
          compromisedWebsites: fallback.compromisedWebsites,
          breachedAccounts: fallback.breachedAccounts,
          breachesByYear: fallback.breachesByYear,
        },
        warning: "Using cached/fallback statistics.",
      });
    }
  }
}

