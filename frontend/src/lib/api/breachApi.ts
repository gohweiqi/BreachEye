/**
 * Breach API Client
 * Functions for interacting with the backend breach detection API
 */

import { API_ENDPOINTS } from "./config";
import { fetchWithRetry, fetchWithCache } from "./requestUtils";

export interface BreachCheckResponse {
  success: boolean;
  breached: boolean;
  breaches: string[];
  breachCount: number;
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
    referenceURL?: string;
    searchable?: boolean;
    sensitive?: boolean;
  }>;
  metrics?: {
    risk?: any;
    passwordStrength?: any;
    industry?: any;
    exposedDataTypes?: any;
  };
  yearHistory: Array<{
    year: number;
    count: number;
  }>;
  pastes?: any;
  error?: string;
}

export interface CombinedBreachResponse {
  success: boolean;
  breached: boolean;
  breachCount: number;
  riskScore: number;
  breaches: string[];
  latestIncident?: string;
  totalBreaches: number;
  yearHistory: Array<{
    year: number;
    count: number;
  }>;
  error?: string;
}

/**
 * Check if an email has been breached (simple check)
 */
export async function checkEmailBreach(
  email: string
): Promise<BreachCheckResponse> {
  try {
    const response = await fetchWithRetry(
      `${API_ENDPOINTS.BREACH.CHECK}/${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      {
        maxRetries: 3,
        initialDelay: 2000, // Start with 2 seconds for breach checks
        maxDelay: 15000, // Max 15 seconds delay
        retryableStatuses: [429, 500, 502, 503, 504],
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Provide user-friendly error messages
      if (response.status === 429) {
        throw new Error(
          "Too many requests. Please wait a moment and try again."
        );
      }

      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking email breach:", error);
    throw error;
  }
}

/**
 * Get comprehensive breach analytics for an email
 */
export async function getBreachAnalytics(
  email: string
): Promise<BreachAnalyticsResponse> {
  try {
    // Use cache with 30 second TTL to prevent duplicate requests
    const cacheKey = `breach-analytics-${email}`;

    return await fetchWithCache(
      cacheKey,
      async () => {
        const response = await fetchWithRetry(
          `${API_ENDPOINTS.BREACH.ANALYTICS}/${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
          {
            maxRetries: 3,
            initialDelay: 2000, // Start with 2 seconds for breach checks
            maxDelay: 15000, // Max 15 seconds delay
            retryableStatuses: [429, 500, 502, 503, 504],
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle 404 as "no breaches found" instead of error
          if (response.status === 404) {
            return {
              success: true,
              email,
              riskScore: 0,
              breachCount: 0,
              breaches: [],
              yearHistory: [],
            };
          }

          // Provide user-friendly error messages
          if (response.status === 429) {
            throw new Error(
              "Too many requests. Please wait a moment and try again."
            );
          }

          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        return await response.json();
      },
      30000 // 30 second cache for breach analytics
    );
  } catch (error) {
    console.error("Error getting breach analytics:", error);
    throw error;
  }
}

/**
 * Check email with combined details (breach check + analytics)
 */
export async function checkEmailWithDetails(
  email: string
): Promise<CombinedBreachResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.BREACH.CHECK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking email with details:", error);
    throw error;
  }
}
