import { Request, Response } from "express";
import {
  XposedOrNotService,
  BreachCheckResponse,
  BreachAnalyticsResponse,
} from "../services/xposedOrNotService";

/**
 * Controller for handling breach-related requests
 */
export class BreachController {
  /**
   * Check if an email has been breached
   * GET /api/breach/check/:email
   */
  static async checkEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({
          success: false,
          error: "Email parameter is required",
        });
        return;
      }

      const breachData = await XposedOrNotService.checkEmail(email);

      // Check if email was found in breaches
      if (breachData.Error === "Not found") {
        res.status(200).json({
          success: true,
          breached: false,
          breaches: [],
          message: "No breaches found for this email",
        });
        return;
      }

      // Email was found in breaches
      const breaches = breachData.breaches?.[0] || [];

      res.status(200).json({
        success: true,
        breached: breaches.length > 0,
        breaches: breaches,
        breachCount: breaches.length,
      });
    } catch (error) {
      console.error("Error checking email breach:", error);

      // Provide more helpful error messages
      let errorMessage = "Internal server error";
      let statusCode = 500;

      if (error instanceof Error) {
        errorMessage = error.message;

        // Map specific errors to appropriate status codes
        if (
          error.message.includes("403") ||
          error.message.includes("forbidden")
        ) {
          statusCode = 503; // Service unavailable (API blocking)
          errorMessage =
            "The breach checking service is temporarily unavailable. Please try again in a few minutes.";
        } else if (
          error.message.includes("429") ||
          error.message.includes("rate limit")
        ) {
          statusCode = 429;
        } else if (error.message.includes("timeout")) {
          statusCode = 504; // Gateway timeout
        }
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get comprehensive breach analytics for an email
   * GET /api/breach/analytics/:email
   */
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({
          success: false,
          error: "Email parameter is required",
        });
        return;
      }

      const analyticsData = await XposedOrNotService.getBreachAnalytics(email);

      // Calculate risk score
      const riskScore = XposedOrNotService.calculateRiskScore(analyticsData);

      // Extract breach details
      const breachDetails =
        analyticsData.ExposedBreaches?.breaches_details || [];
      const breachSummary = analyticsData.BreachesSummary;
      const breachMetrics = analyticsData.BreachMetrics;

      // Format yearly data for easier consumption
      const yearlyData = breachMetrics?.yearwise_details?.[0] || {};
      const yearHistory = Object.entries(yearlyData)
        .filter(([key]) => key.startsWith("y"))
        .map(([key, value]) => ({
          year: parseInt(key.replace("y", "")),
          count: value as number,
        }))
        .sort((a, b) => a.year - b.year);

      res.status(200).json({
        success: true,
        email: email,
        riskScore: riskScore,
        breachCount: breachDetails.length,
        breachSummary: breachSummary,
        breaches: breachDetails.map((breach: any) => {
          // Extract exposed data - handle both array and string formats
          let exposedData = breach.exposedData;

          // If exposedData is a string (semicolon-separated), convert to array
          if (typeof exposedData === "string") {
            exposedData = exposedData
              .split(";")
              .map((item: string) => item.trim())
              .filter((item: string) => item.length > 0);
          }

          // If still no exposed data, try to get from xposed_data in metrics
          if (!exposedData || exposedData.length === 0) {
            if (
              breachMetrics?.xposed_data &&
              Array.isArray(breachMetrics.xposed_data)
            ) {
              // Extract from nested structure
              const extractDataTypes = (data: any): string[] => {
                const types: string[] = [];
                if (Array.isArray(data)) {
                  data.forEach((item: any) => {
                    if (item?.children) {
                      item.children.forEach((child: any) => {
                        if (child?.children) {
                          child.children.forEach((leaf: any) => {
                            if (leaf?.name && leaf.name.startsWith("data_")) {
                              types.push(
                                leaf.name
                                  .replace("data_", "")
                                  .replace(/_/g, " ")
                              );
                            }
                          });
                        }
                      });
                    }
                  });
                }
                return types;
              };
              exposedData = extractDataTypes(breachMetrics.xposed_data);
            }
          }

          // Construct logo URL - handle both relative and absolute paths
          let logoUrl = breach.logo;
          if (logoUrl && !logoUrl.startsWith("http")) {
            // If it's a relative path or filename, construct full URL
            if (logoUrl.startsWith("/")) {
              logoUrl = `https://xposedornot.com${logoUrl}`;
            } else {
              logoUrl = `https://xposedornot.com/static/logos/${logoUrl}`;
            }
          }

          // Extract date - handle multiple formats
          let breachDate = breach.breachedDate;
          if (!breachDate && breach.details) {
            // Try to extract date from description
            const dateMatch = breach.details.match(/\b(\d{4}-\d{2}-\d{2})\b/);
            if (dateMatch) {
              breachDate = dateMatch[1];
            }
          }

          return {
            name:
              breach.breach ||
              breach.breachID ||
              breach["Breach ID"] ||
              "Unknown Breach",
            domain: breach.domain || breach.Domain || undefined,
            date: breachDate || breach["Breached Date"] || undefined,
            exposedData:
              exposedData && exposedData.length > 0 ? exposedData : undefined,
            exposedRecords:
              breach.exposedRecords || breach["Exposed Records"] || undefined,
            description:
              breach.exposureDescription ||
              breach.details ||
              breach["Exposure Description"] ||
              undefined,
            industry: breach.industry || breach.Industry || undefined,
            passwordRisk:
              breach.passwordRisk || breach["Password Risk"] || undefined,
            verified:
              breach.verified !== undefined
                ? breach.verified
                : breach.Verified === "Yes"
                ? true
                : breach.Verified === "No"
                ? false
                : undefined,
            logo: logoUrl || undefined,
            referenceURL:
              breach.referenceURL || breach["Reference URL"] || undefined,
            searchable:
              breach.searchable !== undefined
                ? breach.searchable
                : breach.Searchable === "Yes"
                ? true
                : breach.Searchable === "No"
                ? false
                : undefined,
            sensitive:
              breach.sensitive !== undefined
                ? breach.sensitive
                : breach.Sensitive === "Yes"
                ? true
                : breach.Sensitive === "No"
                ? false
                : undefined,
          };
        }),
        metrics: {
          risk: breachMetrics?.risk?.[0],
          passwordStrength: breachMetrics?.passwords_strength?.[0],
          industry: breachMetrics?.industry,
          exposedDataTypes: breachMetrics?.xposed_data,
        },
        yearHistory: yearHistory,
        pastes: analyticsData.PastesSummary,
      });
    } catch (error) {
      console.error("Error getting breach analytics:", error);

      if (
        error instanceof Error &&
        error.message.includes("No breach data found")
      ) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Provide more helpful error messages
      let errorMessage = "Internal server error";
      let statusCode = 500;

      if (error instanceof Error) {
        errorMessage = error.message;

        // Map specific errors to appropriate status codes
        if (
          error.message.includes("403") ||
          error.message.includes("forbidden")
        ) {
          statusCode = 503; // Service unavailable (API blocking)
          errorMessage =
            "The breach checking service is temporarily unavailable. Please try again in a few minutes.";
        } else if (
          error.message.includes("429") ||
          error.message.includes("rate limit")
        ) {
          statusCode = 429;
        } else if (error.message.includes("timeout")) {
          statusCode = 504; // Gateway timeout
        }
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Combined endpoint: check email and get basic analytics
   * POST /api/breach/check
   * Body: { email: string }
   */
  static async checkEmailWithDetails(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log(`POST /api/breach/check - Request received`);
      console.log(`Request body:`, req.body);
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: "Email is required in request body",
        });
        return;
      }

      // First check if email is breached
      const breachCheck = await XposedOrNotService.checkEmail(email);

      if (breachCheck.Error === "Not found") {
        res.status(200).json({
          success: true,
          breached: false,
          breaches: [],
          breachCount: 0,
          riskScore: 0,
          message: "No breaches found for this email",
        });
        return;
      }

      // If breached, get analytics
      const analyticsData = await XposedOrNotService.getBreachAnalytics(email);
      const riskScore = XposedOrNotService.calculateRiskScore(analyticsData);
      const breaches = breachCheck.breaches?.[0] || [];
      const breachDetails =
        analyticsData.ExposedBreaches?.breaches_details || [];

      // Get latest incident
      const latestBreach =
        breachDetails.length > 0
          ? breachDetails.sort((a, b) => {
              const dateA = a.breachedDate
                ? new Date(a.breachedDate).getTime()
                : 0;
              const dateB = b.breachedDate
                ? new Date(b.breachedDate).getTime()
                : 0;
              return dateB - dateA;
            })[0]
          : null;

      // Format latest incident
      const latestIncident = latestBreach
        ? `${latestBreach.breach || latestBreach.breachID} · ${
            latestBreach.breachedDate
              ? new Date(latestBreach.breachedDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    year: "numeric",
                  }
                )
              : "Unknown date"
          }`
        : undefined;

      // Format yearly history
      const yearlyData =
        analyticsData.BreachMetrics?.yearwise_details?.[0] || {};
      const yearHistory = Object.entries(yearlyData)
        .filter(([key]) => key.startsWith("y"))
        .map(([key, value]) => ({
          year: parseInt(key.replace("y", "")),
          count: value as number,
        }))
        .sort((a, b) => a.year - b.year)
        .filter((entry) => entry.count > 0);

      res.status(200).json({
        success: true,
        breached: true,
        breachCount: breaches.length,
        riskScore: riskScore,
        breaches: breaches,
        latestIncident: latestIncident,
        totalBreaches: breachDetails.length,
        yearHistory: yearHistory,
      });
    } catch (error) {
      console.error("Error checking email with details:", error);

      // Provide more helpful error messages
      let errorMessage = "Internal server error";
      let statusCode = 500;

      if (error instanceof Error) {
        errorMessage = error.message;

        // Map specific errors to appropriate status codes
        if (
          error.message.includes("403") ||
          error.message.includes("forbidden")
        ) {
          statusCode = 503; // Service unavailable (API blocking)
          errorMessage =
            "The breach checking service is temporarily unavailable. Please try again in a few minutes.";
        } else if (
          error.message.includes("429") ||
          error.message.includes("rate limit")
        ) {
          statusCode = 429;
        } else if (error.message.includes("timeout")) {
          statusCode = 504; // Gateway timeout
        }
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
