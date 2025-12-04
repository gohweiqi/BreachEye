/**
 * Request Utilities
 * Helper functions for handling API requests with retry logic and caching
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache for API requests
const requestCache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    initialDelay = 1000, // 1 second
    maxDelay = 10000, // 10 seconds
    backoffMultiplier = 2,
    retryableStatuses = [429, 500, 502, 503, 504],
  } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If successful or non-retryable error, return immediately
      if (response.ok || !retryableStatuses.includes(response.status)) {
        return response;
      }

      // If it's the last attempt, return the error response
      if (attempt === maxRetries) {
        return response;
      }

      // Calculate delay with exponential backoff
      const delay = calculateBackoffDelay(
        attempt,
        initialDelay,
        maxDelay,
        backoffMultiplier
      );

      // For 429 errors, check if there's a Retry-After header
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        if (retryAfter) {
          const retryAfterSeconds = parseInt(retryAfter, 10);
          if (!isNaN(retryAfterSeconds)) {
            await sleep(retryAfterSeconds * 1000);
            continue;
          }
        }
      }

      console.log(
        `Request failed with status ${
          response.status
        }. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries + 1})`
      );
      await sleep(delay);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = calculateBackoffDelay(
        attempt,
        initialDelay,
        maxDelay,
        backoffMultiplier
      );

      console.log(
        `Request failed: ${
          lastError.message
        }. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries + 1})`
      );
      await sleep(delay);
    }
  }

  throw lastError || new Error("Request failed after all retries");
}

/**
 * Get cached data or fetch and cache
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cacheTTL: number = 30000 // 30 seconds default
): Promise<T> {
  // Check cache first
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  // Check if there's already a pending request for this key
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  // Create new request
  const requestPromise = fetchFn()
    .then((data) => {
      // Cache the result
      requestCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + cacheTTL,
      });
      return data;
    })
    .finally(() => {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Clear cache for a specific key or all cache
 */
export function clearCache(cacheKey?: string): void {
  if (cacheKey) {
    requestCache.delete(cacheKey);
  } else {
    requestCache.clear();
  }
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
