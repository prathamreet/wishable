/**
 * Enhanced API Client for Wishable
 * 
 * This module provides direct function calls for all API operations,
 * with improved error handling, token management, and automatic token refresh.
 */

// Store tokens in memory (will be lost on page refresh)
let authTokens = {
  token: null,
  refreshToken: null,
  expiresAt: null
};

/**
 * Set authentication tokens
 * @param {Object} tokens - Auth tokens
 * @param {string} tokens.token - JWT access token
 * @param {string} tokens.refreshToken - JWT refresh token
 * @param {number} tokens.expiresIn - Token expiration in seconds
 */
export function setAuthTokens(tokens) {
  if (!tokens) return;
  
  const { token, refreshToken, expiresIn } = tokens;
  
  if (token) {
    authTokens.token = token;
    // Set expiration time if provided
    if (expiresIn) {
      authTokens.expiresAt = Date.now() + (expiresIn * 1000);
    }
  }
  
  if (refreshToken) {
    authTokens.refreshToken = refreshToken;
  }
}

/**
 * Clear authentication tokens
 */
export function clearAuthTokens() {
  authTokens = {
    token: null,
    refreshToken: null,
    expiresAt: null
  };
}

/**
 * Check if token is expired or about to expire
 * @returns {boolean} - True if token needs refresh
 */
function isTokenExpired() {
  if (!authTokens.expiresAt) return false;
  
  // Consider token expired if less than 5 minutes remaining
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() > (authTokens.expiresAt - fiveMinutes);
}

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<boolean>} - True if refresh was successful
 */
async function refreshAccessToken() {
  if (!authTokens.refreshToken) return false;
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: authTokens.refreshToken })
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    setAuthTokens(data);
    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
}

/**
 * Enhanced fetch wrapper with error handling and token refresh
 * @param {string} endpoint - API endpoint (e.g., '/api/auth/login')
 * @param {Object} options - Fetch options
 * @param {boolean} useAuth - Whether to include auth token
 * @param {boolean} allowRefresh - Whether to attempt token refresh if expired
 * @returns {Promise<any>} - Response data
 */
async function fetchAPI(endpoint, options = {}, useAuth = true, allowRefresh = true) {
  try {
    // Ensure endpoint starts with /api/
    const path = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Set default headers for JSON
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add auth token if needed and available
    if (useAuth && authTokens.token) {
      // Check if token is expired and refresh if needed
      if (allowRefresh && isTokenExpired()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          // If refresh failed, throw an error
          const error = new Error('Session expired. Please log in again.');
          error.status = 401;
          throw error;
        }
      }
      
      headers['Authorization'] = `Bearer ${authTokens.token}`;
    }

    // Make the request
    const response = await fetch(path, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    });

    // Parse the response based on content type
    const contentType = response.headers.get('content-type');
    let data;
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      data = { error: 'Failed to parse server response' };
    }

    // Handle error responses
    if (!response.ok) {
      // For validation errors, don't log as errors
      if (response.status === 400) {
        console.info(`Validation issue: ${data?.error || 'Bad request'}`);
      } else if (response.status === 429 || response.status === 529) {
        console.warn(`Rate limited: ${data?.error || 'Too many requests'}`);
      } else {
        console.error(`API Error [${response.status}]:`, data || 'No response data');
      }

      const errorMessage = data?.error || data?.message || 'API request failed';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data || null;
      error.headers = response.headers;
      throw error;
    }

    return data;
  } catch (error) {
    // If it's already our enhanced error, rethrow it
    if (error.status) throw error;

    // Handle Axios errors that might be passed through
    if (error.isAxiosError && error.response) {
      const status = error.response.status;
      let message = error.message;
      
      // Provide better messages for common status codes
      if (status === 429 || status === 529) {
        message = 'Rate limited by the website. Please try again later.';
      } else if (status === 403) {
        message = 'Access denied by the website. The site might be blocking our requests.';
      }
      
      console.warn(`Axios Error (HTTP ${status}):`, message);
      const enhancedError = new Error(message);
      enhancedError.status = status;
      enhancedError.originalError = error;
      throw enhancedError;
    }

    // Otherwise create a new detailed error
    console.error(`Fetch Error:`, error);
    const enhancedError = new Error(error.message || 'Network request failed');
    enhancedError.originalError = error;
    throw enhancedError;
  }
}

/**
 * Authentication API functions
 */
export const auth = {
  /**
   * Log in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{token: string, refreshToken: string, user: Object, expiresIn: number}>} - Auth data
   */
  async login(email, password) {
    try {
      const result = await fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, false); // Don't use auth token for login
      
      // Store tokens for future requests
      if (result && result.token) {
        setAuthTokens(result);
      } else {
        console.warn('Login successful but no token received');
      }
      return result;
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  },

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Username
   * @returns {Promise<{token: string, refreshToken: string, user: Object, expiresIn: number}>} - Auth data
   */
  async signup(email, password, username) {
    const result = await fetchAPI('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }, false); // Don't use auth token for signup
    
    // Store tokens for future requests
    setAuthTokens(result);
    return result;
  },

  /**
   * Verify a user's token
   * @returns {Promise<{valid: boolean, userId: string}>} - Token validity and user ID
   */
  async verify() {
    return fetchAPI('/api/auth/verify', {
      headers: { 
        'Cache-Control': 'no-store'
      }
    });
  },
  
  /**
   * Refresh the access token
   * @param {string} refreshToken - Refresh token (optional, uses stored token if not provided)
   * @returns {Promise<{token: string, refreshToken: string, user: Object, expiresIn: number}>} - New auth data
   */
  async refreshToken(refreshToken = null) {
    const tokenToUse = refreshToken || authTokens.refreshToken;
    
    if (!tokenToUse) {
      throw new Error('No refresh token available');
    }
    
    const result = await fetchAPI('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokenToUse }),
    }, false, false); // Don't use auth, don't auto-refresh
    
    // Store new tokens
    setAuthTokens(result);
    return result;
  },
  
  /**
   * Log out the current user
   */
  logout() {
    clearAuthTokens();
  }
};

/**
 * User API functions
 */
export const user = {
  /**
   * Get the current user's profile
   * @returns {Promise<Object>} - User profile data
   */
  async getProfile() {
    return fetchAPI('/api/user/profile', {
      headers: { 
        'Cache-Control': 'no-store'
      }
    });
  },
  
  /**
   * Update the current user's profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} - Updated user profile
   */
  async updateProfile(updates) {
    return fetchAPI('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Delete the current user's account
   * @returns {Promise<{success: boolean}>} - Success status
   */
  async deleteAccount() {
    const result = await fetchAPI('/api/user/delete', {
      method: 'DELETE'
    });
    
    // Clear tokens after account deletion
    clearAuthTokens();
    return result;
  }
};

/**
 * Wishlist API functions
 */
export const wishlist = {
  /**
   * Get the current user's wishlist
   * @returns {Promise<{items: Array, count: number}>} - Wishlist items and count
   */
  async getItems() {
    try {
      const response = await fetchAPI('/api/wishlist');
      
      // Handle different response formats
      if (response && response.items) {
        // New format with items and count
        return response;
      } else if (Array.isArray(response)) {
        // Old format (just an array of items)
        return {
          items: response,
          count: response.length
        };
      } else {
        // Unexpected format, return empty array
        console.warn('Unexpected response format from wishlist API:', response);
        return {
          items: [],
          count: 0
        };
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  /**
   * Add an item to the wishlist
   * @param {Object} item - Wishlist item data (with url)
   * @returns {Promise<{message: string, item: Object}>} - Result with created item
   */
  async addItem(item) {
    return fetchAPI('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },
  
  /**
   * Get a specific wishlist item
   * @param {string} itemId - Wishlist item ID
   * @returns {Promise<{item: Object}>} - Wishlist item
   */
  async getItem(itemId) {
    return fetchAPI(`/api/wishlist/${itemId}`);
  },

  /**
   * Update a wishlist item with re-scraping
   * @param {string} itemId - Wishlist item ID
   * @param {Object} updates - Updates with url for re-scraping
   * @returns {Promise<{message: string, item: Object}>} - Result with updated item
   */
  async updateItem(itemId, updates) {
    return fetchAPI(`/api/wishlist/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  
  /**
   * Update specific fields of a wishlist item without re-scraping
   * @param {string} itemId - Wishlist item ID
   * @param {Object} updates - Fields to update (notes, priority, etc.)
   * @returns {Promise<{message: string, item: Object}>} - Result with updated item
   */
  async patchItem(itemId, updates) {
    return fetchAPI(`/api/wishlist/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Delete a wishlist item
   * @param {string} itemId - Wishlist item ID
   * @returns {Promise<{message: string, id: string}>} - Success message with deleted ID
   */
  async deleteItem(itemId) {
    return fetchAPI(`/api/wishlist/${itemId}`, {
      method: 'DELETE'
    });
  }
};

/**
 * Scraping API functions
 */
export const scraper = {
  /**
   * Scrape product details from a URL without saving to wishlist
   * @param {string} url - Product URL to scrape
   * @returns {Promise<Object>} - Scraped product details
   */
  async scrapeUrl(url) {
    return fetchAPI('/api/scrape', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  },
  
  /**
   * Batch scrape multiple URLs
   * @param {string[]} urls - Array of URLs to scrape
   * @param {Object} options - Scraping options
   * @returns {Promise<Object>} - Batch scraping results
   */
  async batchScrape(urls, options = {}) {
    return fetchAPI('/api/scrape?batch=true', {
      method: 'POST',
      body: JSON.stringify({ urls, options })
    });
  },
  
  /**
   * Validate if a URL is likely a product page
   * @param {string} url - URL to validate
   * @returns {Promise<{url: string, domain: string, isValid: boolean, message: string}>} - Validation result
   */
  async validateUrl(url) {
    return fetchAPI('/api/scrape/validate', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  }
};

// Export the raw fetchAPI function for any custom API calls
export { fetchAPI };