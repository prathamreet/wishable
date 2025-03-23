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

/**
 * API utilities for handling fetch requests with proper error handling
 * and absolute URL resolution based on environment.
 */

/**
 * Builds an absolute API URL based on the path
 * @param {string} path - Relative API path like '/api/wishlist'
 * @returns {string} - Absolute URL
 */
export function getApiUrl(path) {
  // In client-side code, use NEXT_PUBLIC_APP_URL as base URL for absolute paths
  // In production (especially on Vercel), this ensures requests go to the correct domain
  const isClient = typeof window !== 'undefined';
  let baseUrl = '';
  
  if (isClient) {
    // For client-side requests, use the environment variable if available
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    
    // If no environment variable is set, use the current origin
    if (!baseUrl && window.location) {
      baseUrl = window.location.origin;
    }
  }
  
  // Make sure path starts with '/' and remove duplicate slashes
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Only use the baseUrl for absolute paths in client-side code
  return isClient ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

/**
 * Enhanced fetch function with better error handling
 * @param {string} path - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
export async function apiFetch(path, options = {}) {
  const url = getApiUrl(path);
  
  try {
    console.log(`🔄 API Request: ${url}`);
    
    // Add additional headers for better debugging
    const enhancedOptions = {
      ...options,
      headers: {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest',
      }
    };
    
    // Add request timeout (15 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    if (!enhancedOptions.signal) {
      enhancedOptions.signal = controller.signal;
    }
    
    const response = await fetch(url, enhancedOptions);
    clearTimeout(timeoutId);
    
    // Get response details for debugging
    let responseData;
    const contentType = response.headers.get('content-type');
    
    // Read response data based on content type
    try {
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (parseError) {
      console.error(`❌ Response parsing error:`, parseError);
      responseData = `Failed to parse response: ${parseError.message}`;
    }
    
    // Log response status and some headers for debugging
    console.log(`📥 Response [${response.status}]:`, {
      url,
      status: response.status,
      contentType,
      ...(typeof window !== 'undefined' ? { responsePreview: responseData } : {})
    });
    
    if (!response.ok) {
      console.error(`❌ API Error [${response.status}]:`, responseData);
      
      // Create a detailed error object
      const error = new Error(
        responseData.error || responseData.message || 'API request failed'
      );
      error.status = response.status;
      error.data = responseData;
      error.url = url;
      throw error;
    }
    
    console.log(`✅ API Success: ${url}`);
    return responseData;
  } catch (error) {
    // If the request was aborted due to timeout
    if (error.name === 'AbortError') {
      console.error(`⏱️ Request timeout for: ${url}`);
      const timeoutError = new Error('Request timed out after 15 seconds');
      timeoutError.status = 408;
      timeoutError.url = url;
      throw timeoutError;
    }
    
    // If it's already our enhanced error, rethrow it
    if (error.status) throw error;
    
    // Otherwise create a new detailed error
    console.error(`❌ Fetch Error for ${url}:`, error);
    const enhancedError = new Error(error.message || 'Network request failed');
    enhancedError.originalError = error;
    enhancedError.url = url;
    throw enhancedError;
  }
} 