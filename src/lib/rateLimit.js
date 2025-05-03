/**
 * Simple in-memory rate limiting utility for API routes
 * For production, consider using a Redis-based solution for distributed environments
 */

// Store for rate limit data
const rateLimitStore = new Map();

// Clean up the store periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limiting middleware for API routes
 * @param {Object} options - Rate limiting options
 * @param {number} options.limit - Maximum number of requests allowed in the window
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {Function} options.keyGenerator - Function to generate a unique key for the request
 * @returns {Function} - Middleware function
 */
export function rateLimit({ 
  limit = 60, 
  windowMs = 60 * 1000, // 1 minute by default
  keyGenerator = (req) => {
    // Default key generator uses IP address or a fallback
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `${ip}`;
  }
}) {
  return async function rateLimitMiddleware(req) {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or initialize rate limit data for this key
    let rateData = rateLimitStore.get(key);
    if (!rateData || now > rateData.resetTime) {
      rateData = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, rateData);
    }
    
    // Increment request count
    rateData.count += 1;
    
    // Calculate remaining requests and time until reset
    const remaining = Math.max(0, limit - rateData.count);
    const resetIn = Math.max(0, rateData.resetTime - now);
    
    // Set rate limit headers
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString()
    };
    
    // If limit exceeded, return 429 Too Many Requests
    if (rateData.count > limit) {
      return {
        limited: true,
        headers: {
          ...headers,
          'Retry-After': Math.ceil(resetIn / 1000).toString()
        },
        status: 429,
        message: 'Too many requests, please try again later.'
      };
    }
    
    // Not limited
    return {
      limited: false,
      headers
    };
  };
}

/**
 * Apply rate limiting to a route handler
 * @param {Function} handler - The route handler function
 * @param {Object} options - Rate limiting options
 * @returns {Function} - Enhanced route handler with rate limiting
 */
export function withRateLimit(handler, options = {}) {
  const limiter = rateLimit(options);
  
  return async function(req, ...args) {
    try {
      const result = await limiter(req);
      
      // If rate limited, return 429 response
      if (result.limited) {
        return new Response(
          JSON.stringify({ error: result.message }),
          {
            status: result.status,
            headers: {
              'Content-Type': 'application/json',
              ...result.headers
            }
          }
        );
      }
      
      // Not limited, call the handler
      const response = await handler(req, ...args);
      
      // If response is not a Response object, return it as is
      if (!(response instanceof Response)) {
        console.error('Handler did not return a Response object');
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...result.headers
            }
          }
        );
      }
      
      // Clone the response to add headers
      const headers = new Headers(response.headers);
      Object.entries(result.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

/**
 * Different rate limit configurations for various API endpoints
 */
export const rateLimits = {
  // Authentication endpoints - stricter limits to prevent brute force
  auth: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown';
      // Just use IP for rate limiting to avoid body parsing issues
      return `auth:${ip}`;
    }
  },
  
  // Standard API endpoints
  api: {
    limit: 60,
    windowMs: 60 * 1000 // 1 minute
  },
  
  // Public endpoints - more lenient
  public: {
    limit: 120,
    windowMs: 60 * 1000 // 1 minute
  }
};