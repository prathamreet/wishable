/**
 * API Utilities for consistent handling of requests and responses
 */
import logger from './logger';

/**
 * Cache control options for API responses
 */
export const cacheOptions = {
  /**
   * No caching - use for user-specific data
   */
  NO_CACHE: {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  
  /**
   * Public caching with short TTL - use for data that changes frequently
   * but can be shared (5 minutes)
   */
  SHORT: {
    'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60'
  },
  
  /**
   * Public caching with medium TTL - use for data that changes occasionally
   * (1 hour)
   */
  MEDIUM: {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600'
  },
  
  
  /**
   * Public caching with long TTL - use for stable data (1 day)
   */
  LONG: {
    'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600'
  }
};

/**
 * Creates an error response with consistent formatting
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {any} details - Additional error details
 * @returns {Response} - Next.js Response object
 */
export function errorResponse(message, status = 500, details = null) {
  logger.error(`API Error [${status}]: ${message}`, details);
  
  return new Response(
    JSON.stringify({ 
      error: message,
      ...(details && process.env.NODE_ENV === 'development' ? { details } : {})
    }),
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        ...cacheOptions.NO_CACHE
      }
    }
  );
}

/**
 * Creates a success response with consistent formatting
 * @param {any} data - Response data 
 * @param {number} status - HTTP status code
 * @param {object} cacheOption - Cache control option
 * @returns {Response} - Next.js Response object
 */
export function successResponse(data, status = 200, cacheOption = cacheOptions.NO_CACHE) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...cacheOption
      }
    }
  );
} 