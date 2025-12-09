/**
 * Monthly Summary API Client
 * Functions for interacting with the monthly summary API
 */

import { API_ENDPOINTS } from "./config";
import { fetchWithRetry } from "./requestUtils";

export interface MonthlySummaryEmail {
  email: string;
  status: "safe" | "breached";
  breaches: number;
  lastChecked: string;
}

export interface MonthlySummary {
  totalEmails: number;
  safeEmails: number;
  breachedEmails: number;
  totalBreaches: number;
  emails: MonthlySummaryEmail[];
  month?: number;
  year?: number;
}

export interface MonthlySummaryResponse {
  success: boolean;
  summary: MonthlySummary;
}

/**
 * Get monthly summary data
 * @param userId User ID
 * @param year Year (default: current year)
 * @param month Month (1-12, default: current month)
 */
export async function getMonthlySummary(
  userId: string,
  year?: number,
  month?: number
): Promise<MonthlySummaryResponse> {
  try {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    if (month) params.append("month", month.toString());

    const url = `${API_ENDPOINTS.MONTHLY_SUMMARY}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await fetchWithRetry(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
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
    console.error("Error fetching monthly summary:", error);
    throw error;
  }
}
