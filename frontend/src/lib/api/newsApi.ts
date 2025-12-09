/**
 * News API Client
 * Functions for interacting with the backend news API
 */

import { API_ENDPOINTS } from "./config";
import { fetchWithRetry } from "./requestUtils";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  imageUrl?: string;
}

export interface NewsResponse {
  success: boolean;
  news: NewsItem[];
  lastUpdated: string;
}

/**
 * Get latest cybersecurity and breach news
 * @param limit Maximum number of news items to return (default: 20)
 */
export async function getLatestNews(limit: number = 20): Promise<NewsResponse> {
  try {
    const response = await fetchWithRetry(
      `${API_ENDPOINTS.NEWS.LATEST}?limit=${limit}`,
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
    console.error("Error fetching latest news:", error);
    throw error;
  }
}

/**
 * Search news by keywords
 * @param query Search query
 * @param limit Maximum number of news items to return (default: 20)
 */
export async function searchNews(
  query: string,
  limit: number = 20
): Promise<NewsResponse> {
  try {
    const response = await fetchWithRetry(
      `${API_ENDPOINTS.NEWS.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`,
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
    console.error("Error searching news:", error);
    throw error;
  }
}

