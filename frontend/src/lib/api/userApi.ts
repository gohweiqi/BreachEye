/**
 * User API Client
 * Functions for interacting with the backend user account API
 */

import { API_ENDPOINTS } from "./config";
import { fetchWithRetry } from "./requestUtils";

export interface UserAccountData {
  userId: string;
  joinedDate: string;
  accountStatus: string;
  monitoredEmails: number;
  totalBreaches: number;
}

/**
 * Get user account data
 */
export async function getUserAccountData(
  userId: string
): Promise<UserAccountData> {
  try {
    const response = await fetchWithRetry(
      `${API_ENDPOINTS.USER.ACCOUNT}`,
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
    return data.data;
  } catch (error) {
    console.error("Error fetching user account data:", error);

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
 * Delete user account and all associated data
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    const response = await fetchWithRetry(
      `${API_ENDPOINTS.USER.ACCOUNT}`,
      {
        method: "DELETE",
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

    // Account deleted successfully
    return;
  } catch (error) {
    console.error("Error deleting user account:", error);

    // Provide more helpful error messages
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000"
      );
    }

    throw error;
  }
}

