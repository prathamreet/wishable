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
    // Silently fail refresh as it's often handled by redirecting to login
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
      data = { error: 'Failed to parse server response' };
    }

    // Handle error responses
    if (!response.ok) {
      const isDev = process.env.NODE_ENV === 'development';
      
      // Log errors more selectively to avoid console noise in production
      if (isDev) {
        if (response.status === 401 || response.status === 403) {
          console.warn(`Auth issue (${response.status}):`, data?.error || 'Unauthorized');
        } else if (response.status === 400) {
          console.info(`Validation issue (400):`, data?.error || 'Bad request');
        } else if (response.status === 429 || response.status === 529) {
          console.warn(`Rate limited (${response.status}):`, data?.error || 'Too many requests');
        } else {
          console.error(`API Error [${response.status}]:`, data || 'No response data');
        }
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
    if (error.status) throw error;

    // Handle network or unexpected errors
    if (process.env.NODE_ENV === 'development') {
      console.error(`Fetch Error:`, error);
    }
    
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
   */
  async login(email, password) {
    const result = await fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false); // Don't use auth token for login
    
    if (result && result.token) {
      setAuthTokens(result);
    }
    return result;
  },

  /**
   * Sign up a new user
   */
  async signup(email, password, username) {
    const result = await fetchAPI('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }, false);
    
    setAuthTokens(result);
    return result;
  },

  /**
   * Verify a user's token
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
   */
  async refreshToken(refreshToken = null) {
    const tokenToUse = refreshToken || authTokens.refreshToken;
    
    if (!tokenToUse) {
      throw new Error('No refresh token available');
    }
    
    const result = await fetchAPI('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokenToUse }),
    }, false, false);
    
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
  async getProfile() {
    return fetchAPI('/api/user/profile', {
      headers: { 
        'Cache-Control': 'no-store'
      }
    });
  },
  
  async updateProfile(updates) {
    return fetchAPI('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteAccount() {
    const result = await fetchAPI('/api/user/delete', {
      method: 'DELETE'
    });
    
    clearAuthTokens();
    return result;
  }
};

/**
 * Wishlist API functions
 */
export const wishlist = {
  async getItems() {
    try {
      const response = await fetchAPI('/api/wishlist');
      
      if (response && response.items) {
        return response;
      } else if (Array.isArray(response)) {
        return {
          items: response,
          count: response.length
        };
      } else {
        return {
          items: [],
          count: 0
        };
      }
    } catch (error) {
      throw error;
    }
  },

  async addItem(item) {
    return fetchAPI('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },
  
  async getItem(itemId) {
    return fetchAPI(`/api/wishlist/${itemId}`);
  },

  async updateItem(itemId, updates) {
    return fetchAPI(`/api/wishlist/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  
  async patchItem(itemId, updates) {
    return fetchAPI(`/api/wishlist/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

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
  async scrapeUrl(url) {
    return fetchAPI('/api/scrape', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  },
  
  async batchScrape(urls, options = {}) {
    return fetchAPI('/api/scrape?batch=true', {
      method: 'POST',
      body: JSON.stringify({ urls, options })
    });
  },
  
  async validateUrl(url) {
    return fetchAPI('/api/scrape/validate', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  }
};

export { fetchAPI };
