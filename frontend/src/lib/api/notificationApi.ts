/**
 * Notification Management API Client
 * Functions for interacting with the backend notification API
 */

import { API_ENDPOINTS } from "./config";
import { fetchWithRetry } from "./requestUtils";

export interface Notification {
  id: string;
  type: "breach" | "summary" | "security" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  createdAt?: string;
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  try {
    const response = await fetchWithRetry(
      `${API_ENDPOINTS.NOTIFICATIONS}`,
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
    return data.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000"
      );
    }

    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.NOTIFICATIONS}/read-all`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}



