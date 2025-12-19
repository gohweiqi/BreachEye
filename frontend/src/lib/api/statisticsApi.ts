/**
 * Statistics API Client
 * Functions for interacting with the backend statistics API
 */

import { API_ENDPOINTS } from "./config";
import { fetchWithRetry } from "./requestUtils";

export interface GlobalStatistics {
  compromisedWebsites: number;
  breachedAccounts: number;
  breachesByYear: Record<string, number>;
}

export interface StatisticsResponse {
  success: boolean;
  data: GlobalStatistics;
  warning?: string;
}

/**
 * Get global breach statistics
 */
export async function getGlobalStatistics(): Promise<StatisticsResponse> {
  try {
    const response = await fetchWithRetry(
      API_ENDPOINTS.STATISTICS,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      {
        maxRetries: 2,
        initialDelay: 1000,
        maxDelay: 5000,
        retryableStatuses: [429, 500, 502, 503, 504],
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching global statistics:", error);
    throw error;
  }
}

