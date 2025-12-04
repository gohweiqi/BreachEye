/**
 * Email Management API Client
 * Functions for interacting with the backend email management API
 */

import { API_ENDPOINTS } from "./config";
import { BreachAnalyticsResponse } from "./breachApi";
import { fetchWithRetry, fetchWithCache } from "./requestUtils";

export interface MonitoredEmail {
  id: string;
  email: string;
  status: "safe" | "breached";
  breaches: number;
  addedDate: string;
  breachData: BreachAnalyticsResponse | null;
  lastChecked?: string;
}

/**
 * Get user ID from session (helper function)
 */
function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  // In a real app, you'd get this from your auth system
  // For now, we'll use a placeholder - you'll need to pass it from the component
  return null;
}

/**
 * Get all monitored emails for the current user
 */
export async function getMonitoredEmails(
  userId: string
): Promise<MonitoredEmail[]> {
  try {
    // Use cache with 10 second TTL to prevent duplicate requests
    const cacheKey = `monitored-emails-${userId}`;

    return await fetchWithCache(
      cacheKey,
      async () => {
        const response = await fetchWithRetry(
          `${API_ENDPOINTS.EMAILS}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "user-id": userId,
            },
          },
          {
            maxRetries: 3,
            initialDelay: 1000,
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

        const data = await response.json();
        return data.emails || [];
      },
      10000 // 10 second cache
    );
  } catch (error) {
    console.error("Error fetching monitored emails:", error);

    // Provide more helpful error messages
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000"
      );
    }

    throw error;
  }
}

/**
 * Add a new monitored email
 */
export async function addMonitoredEmail(
  userId: string,
  email: string
): Promise<MonitoredEmail> {
  try {
    const response = await fetchWithRetry(
      `${API_ENDPOINTS.EMAILS}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
        body: JSON.stringify({ email }),
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
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

    const data = await response.json();
    return data.email;
  } catch (error) {
    console.error("Error adding monitored email:", error);

    // Provide more helpful error messages
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000"
      );
    }

    throw error;
  }
}

/**
 * Delete a monitored email
 */
export async function deleteMonitoredEmail(
  userId: string,
  emailId: string
): Promise<void> {
  try {
    const response = await fetch(`${API_ENDPOINTS.EMAILS}/${emailId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "user-id": userId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error deleting monitored email:", error);
    throw error;
  }
}

/**
 * Re-check an email for breaches
 */
export async function checkEmailBreaches(
  userId: string,
  emailId: string
): Promise<MonitoredEmail> {
  try {
    const response = await fetch(`${API_ENDPOINTS.EMAILS}/${emailId}/check`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "user-id": userId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.email;
  } catch (error) {
    console.error("Error checking email breaches:", error);
    throw error;
  }
}
