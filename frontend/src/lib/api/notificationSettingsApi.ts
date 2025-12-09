/**
 * Notification Settings API Client
 */

import { API_ENDPOINTS } from "./config";

export interface NotificationSettings {
  websiteNotifications: boolean;
  emailNotifications: boolean;
  monthlySummary: boolean;
  securityUpdates: boolean;
}

/**
 * Get notification settings for user
 */
export async function getNotificationSettings(
  userId: string
): Promise<NotificationSettings> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATION_SETTINGS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "user-id": userId,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.settings;
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATION_SETTINGS, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "user-id": userId,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.settings;
}

