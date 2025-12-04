/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  BREACH: {
    CHECK: `${API_BASE_URL}/api/breach/check`,
    ANALYTICS: `${API_BASE_URL}/api/breach/analytics`,
  },
  EMAILS: `${API_BASE_URL}/api/emails`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
