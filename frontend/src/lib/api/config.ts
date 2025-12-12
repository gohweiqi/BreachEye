/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://breacheye-production.up.railway.app";

export const API_ENDPOINTS = {
  BREACH: {
    CHECK: `${API_BASE_URL}/api/breach/check`,
    ANALYTICS: `${API_BASE_URL}/api/breach/analytics`,
  },
  EMAILS: `${API_BASE_URL}/api/emails`,
  USER: {
    ACCOUNT: `${API_BASE_URL}/api/user/account`,
  },
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  NOTIFICATION_SETTINGS: `${API_BASE_URL}/api/notification-settings`,
  NEWS: {
    LATEST: `${API_BASE_URL}/api/news/latest`,
    SEARCH: `${API_BASE_URL}/api/news/search`,
  },
  MONTHLY_SUMMARY: `${API_BASE_URL}/api/monthly-summary`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
