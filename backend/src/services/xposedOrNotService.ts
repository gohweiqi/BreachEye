import axios, { AxiosError } from "axios";

/**
 * Service for interacting with XposedOrNot API
 * API Documentation: https://xposedornot.com/api_doc
 */

const XPOSED_API_BASE_URL = "https://api.xposedornot.com/v1";

export interface BreachCheckResponse {
  breaches?: string[][];
  Error?: string;
}

export interface BreachAnalyticsResponse {
  BreachMetrics?: {
    industry?: any[];
    passwords_strength?: Array<{
      EasyToCrack: number;
      PlainText: number;
      StrongHash: number;
      Unknown: number;
    }>;
    risk?: Array<{
      risk_label: string;
      risk_score: number;
    }>;
    xposed_data?: any[];
    yearwise_details?: Array<Record<string, number>>;
  };
  BreachesSummary?: {
    site?: string;
  };
  ExposedBreaches?: {
    breaches_details?: Array<{
      breach?: string;
      breachID?: string;
      breachedDate?: string;
      domain?: string;
      exposedData?: string[];
      exposedRecords?: number;
      exposureDescription?: string;
      industry?: string;
      logo?: string;
      passwordRisk?: string;
      referenceURL?: string;
      searchable?: boolean;
      sensitive?: boolean;
      verified?: boolean;
    }>;
  };
  ExposedPastes?: any;
  PastesSummary?: any;
  PasteMetrics?: any;
}

export class XposedOrNotService {
  /**
   * Check if an email address has been involved in any known data breaches
   * @param email - Email address to check
   * @returns Promise with breach data or error
   */
  static async checkEmail(email: string): Promise<BreachCheckResponse> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Rate limit: 1 query per second as per API documentation
      await this.delay(1000);

      const response = await axios.get<BreachCheckResponse>(
        `${XPOSED_API_BASE_URL}/check-email/${encodeURIComponent(email)}`,
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
          },
          timeout: 10000, // 10 second timeout
          validateStatus: (status) => {
            // Accept all status codes so we can handle them manually
            return status >= 200 && status < 600;
          },
        }
      );

      // Handle different status codes
      if (response.status === 404) {
        return { Error: "Not found" };
      }

      if (response.status === 403) {
        throw new Error(
          "Access forbidden (403). The API may be blocking automated requests. Please try again later."
        );
      }

      if (response.status !== 200) {
        throw new Error(
          `API returned status ${response.status}. Please try again later.`
        );
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        const statusText = axiosError.response?.statusText;

        // Handle different error status codes
        if (status === 404) {
          return { Error: "Not found" };
        }

        if (status === 403) {
          throw new Error(
            "Access forbidden. The XposedOrNot API may be blocking requests. Please try again later or check if the API is temporarily unavailable."
          );
        }

        if (status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait a moment and try again. The API allows 1 query per second."
          );
        }

        if (status === 502 || status === 503) {
          throw new Error(
            "XposedOrNot API is temporarily unavailable. Please try again in a few moments."
          );
        }

        // Provide more detailed error message
        const errorMessage = axiosError.response?.data
          ? typeof axiosError.response.data === 'object'
            ? JSON.stringify(axiosError.response.data)
            : axiosError.response.data
          : axiosError.message;

        throw new Error(
          `XposedOrNot API error (${status || 'Unknown'}): ${errorMessage || statusText || 'Unable to connect to the API'}`
        );
      }

      throw error;
    }
  }

  /**
   * Get comprehensive breach analytics for an email address
   * @param email - Email address to analyze
   * @returns Promise with detailed breach analytics
   */
  static async getBreachAnalytics(
    email: string
  ): Promise<BreachAnalyticsResponse> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Rate limit: 1 query per second
      await this.delay(1000);

      const response = await axios.get<BreachAnalyticsResponse>(
        `${XPOSED_API_BASE_URL}/breach-analytics`,
        {
          params: {
            email: email,
          },
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
          },
          timeout: 15000, // 15 second timeout for analytics
          validateStatus: (status) => {
            // Accept all status codes so we can handle them manually
            return status >= 200 && status < 600;
          },
        }
      );

      // Handle different status codes
      if (response.status === 404) {
        throw new Error("No breach data found for this email");
      }

      if (response.status === 403) {
        throw new Error(
          "Access forbidden (403). The API may be blocking automated requests. Please try again later."
        );
      }

      if (response.status !== 200) {
        throw new Error(
          `API returned status ${response.status}. Please try again later.`
        );
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        const statusText = axiosError.response?.statusText;

        // Handle different error status codes
        if (status === 404) {
          throw new Error("No breach data found for this email");
        }

        if (status === 403) {
          throw new Error(
            "Access forbidden. The XposedOrNot API may be blocking requests. Please try again later or check if the API is temporarily unavailable."
          );
        }

        if (status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait a moment and try again. The API allows 1 query per second."
          );
        }

        if (status === 502 || status === 503) {
          throw new Error(
            "XposedOrNot API is temporarily unavailable. Please try again in a few moments."
          );
        }

        // Provide more detailed error message
        const errorMessage = axiosError.response?.data
          ? typeof axiosError.response.data === 'object'
            ? JSON.stringify(axiosError.response.data)
            : axiosError.response.data
          : axiosError.message;

        throw new Error(
          `XposedOrNot API error (${status || 'Unknown'}): ${errorMessage || statusText || 'Unable to connect to the API'}`
        );
      }

      throw error;
    }
  }

  /**
   * Calculate risk score based on breach data
   * @param breachData - Breach analytics data
   * @returns Risk score (0-100)
   */
  static calculateRiskScore(breachData: BreachAnalyticsResponse): number {
    let riskScore = 0;

    // Base risk from number of breaches
    const breachCount =
      breachData.ExposedBreaches?.breaches_details?.length || 0;
    riskScore += Math.min(breachCount * 10, 50);

    // Risk from password strength
    const passwordStrength = breachData.BreachMetrics?.passwords_strength?.[0];
    if (passwordStrength) {
      if (passwordStrength.PlainText > 0) riskScore += 30;
      else if (passwordStrength.EasyToCrack > 0) riskScore += 20;
    }

    // Risk from existing risk score
    const existingRisk = breachData.BreachMetrics?.risk?.[0];
    if (existingRisk) {
      riskScore = Math.max(riskScore, existingRisk.risk_score);
    }

    // Cap at 100
    return Math.min(riskScore, 100);
  }

  /**
   * Helper function to delay execution (for rate limiting)
   * @param ms - Milliseconds to delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}


