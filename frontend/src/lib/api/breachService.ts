/**
 * Breach Service
 * Service for interacting with the breach detection API
 */

import { API_ENDPOINTS } from "./config";

export interface BreachCheckResponse {
  success: boolean;
  breached: boolean;
  breachCount?: number;
  breaches?: string[];
  riskScore?: number;
  latestIncident?: string;
  totalBreaches?: number;
  yearHistory?: Array<{
    year: number;
    count: number;
  }>;
  message?: string;
  error?: string;
}

export interface BreachAnalyticsResponse {
  success: boolean;
  email: string;
  riskScore: number;
  breachCount: number;
  breachSummary?: any;
  breaches: Array<{
    name: string;
    domain?: string;
    date?: string;
    exposedData?: string[];
    exposedRecords?: number;
    description?: string;
    industry?: string;
    passwordRisk?: string;
    verified?: boolean;
    logo?: string;
  }>;
  metrics?: any;
  yearHistory: Array<{
    year: number;
    count: number;
  }>;
  pastes?: any;
  error?: string;
}

class BreachService {
  /**
   * Check if an email has been breached
   * @param email - Email address to check
   * @returns Promise with breach check results
   */
  /**
   * Create a timeout promise that rejects after specified milliseconds
   */
  private static createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), ms);
    });
  }

  static async checkEmail(email: string): Promise<BreachCheckResponse> {
    const timeoutMs = 30000; // 30 seconds
    const abortController = new AbortController();

    try {
      console.log("Calling API:", API_ENDPOINTS.BREACH.CHECK);
      console.log("API Base URL:", API_ENDPOINTS.BREACH.CHECK.split("/api")[0]);
      console.log("Request payload:", { email });

      // Create timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeoutMs);

      const fetchPromise = fetch(API_ENDPOINTS.BREACH.CHECK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        signal: abortController.signal,
      });

      const response = await fetchPromise;
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: BreachCheckResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error checking email breach:", error);

      // Handle specific error types
      if (error.name === "AbortError" || error.message === "Request timeout") {
        throw new Error(
          "Request timeout. The server is taking too long to respond. Please try again."
        );
      }

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Unable to connect to the server. Please ensure:\n" +
            "1. The backend server is running on http://localhost:5000\n" +
            "2. CORS is properly configured\n" +
            "3. There are no firewall issues blocking the connection"
        );
      }

      // Re-throw with original error message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("An unexpected error occurred. Please try again.");
    }
  }

  /**
   * Get comprehensive breach analytics for an email
   * @param email - Email address to analyze
   * @returns Promise with detailed breach analytics
   */
  static async getAnalytics(email: string): Promise<BreachAnalyticsResponse> {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(
        `${API_ENDPOINTS.BREACH.ANALYTICS}/${encodedEmail}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: BreachAnalyticsResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting breach analytics:", error);
      throw error;
    }
  }

  /**
   * Quick check (simple endpoint)
   * @param email - Email address to check
   * @returns Promise with simple breach check
   */
  static async quickCheck(email: string): Promise<BreachCheckResponse> {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(
        `${API_ENDPOINTS.BREACH.CHECK}/${encodedEmail}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: BreachCheckResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error in quick breach check:", error);
      throw error;
    }
  }
}

export default BreachService;
