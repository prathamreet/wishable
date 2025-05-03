# Enhanced API System for Wishable

This document explains the enhanced API system implemented in the Wishable application.

## Overview

The API system has been redesigned to be more robust, secure, and easier to use. It features standardized responses, improved error handling, rate limiting, and token refresh capabilities.

## Key Components

### 1. `apiClient.js`

This is the main module that provides direct function calls for all API operations. It's organized into logical sections:

- `auth` - Authentication-related functions (login, signup, verify, refresh)
- `user` - User profile and account management
- `wishlist` - Wishlist item operations

### 2. How to Use

Instead of constructing URLs and fetch options manually, you can now use simple function calls:

```javascript
// Old approach
const data = await apiFetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// New approach
const data = await auth.login(email, password);
```

### 3. Benefits

- **Simpler code**: No need to worry about URL construction or fetch options
- **Better organization**: Functions are grouped by domain (auth, user, wishlist)
- **Improved maintainability**: Changes to API endpoints only need to be made in one place
- **Consistent error handling**: All API calls use the same error handling approach
- **Rate limiting**: Protection against abuse
- **Token refresh**: Automatic token rotation for better security

## API Endpoints

### Authentication

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates a user and returns tokens
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "username": "username",
      "slug": "username",
      "displayName": "Display Name",
      "profilePicture": "url_to_profile_picture",
      "theme": "light"
    },
    "expiresIn": 2592000
  }
  ```

#### Signup
- **Endpoint**: `POST /api/auth/signup`
- **Description**: Creates a new user account
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "username": "username"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "username": "username",
      "slug": "username"
    },
    "expiresIn": 2592000
  }
  ```

#### Refresh Token
- **Endpoint**: `POST /api/auth/refresh`
- **Description**: Refreshes an expired access token
- **Request Body**:
  ```json
  {
    "refreshToken": "refresh_token_here"
  }
  ```
- **Response**: Same as login response

### User Management

#### Get Profile
- **Endpoint**: `GET /api/user/profile`
- **Description**: Gets the current user's profile
- **Headers**: `Authorization: Bearer token`
- **Response**:
  ```json
  {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "displayName": "Display Name",
    "profilePicture": "url_to_profile_picture",
    "bio": "User bio",
    "wishlistCount": 10,
    "activeWishlistCount": 8,
    "settings": {
      "theme": "light",
      "privacy": {
        "profileVisibility": "public",
        "wishlistVisibility": "public"
      },
      "notifications": {
        "email": true,
        "priceDrops": true,
        "stockAlerts": true
      }
    }
  }
  ```

#### Update Profile
- **Endpoint**: `PUT /api/user/profile`
- **Description**: Updates the current user's profile
- **Headers**: `Authorization: Bearer token`
- **Request Body**: Any user fields to update
- **Response**: Updated user object

#### Delete Account
- **Endpoint**: `DELETE /api/user/delete`
- **Description**: Deletes the current user's account
- **Headers**: `Authorization: Bearer token`
- **Response**: Success message

### Scraping Operations

#### Scrape URL
- **Endpoint**: `POST /api/scrape`
- **Description**: Scrapes product details from a URL without saving to wishlist
- **Headers**: `Authorization: Bearer token`
- **Request Body**:
  ```json
  {
    "url": "https://example.com/product"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Product details scraped successfully",
    "product": {
      "name": "Product Name",
      "price": 99.99,
      "thumbnail": "url_to_thumbnail",
      "description": "Product description",
      "site": "example.com",
      "scrapedAt": "2023-01-01T00:00:00Z",
      "url": "https://example.com/product",
      "scrapingStatus": {
        "isComplete": true,
        "warnings": [],
        "siteSupported": true
      }
    }
  }
  ```

#### Batch Scrape URLs
- **Endpoint**: `POST /api/scrape?batch=true`
- **Description**: Scrapes multiple URLs in parallel
- **Headers**: `Authorization: Bearer token`
- **Request Body**:
  ```json
  {
    "urls": [
      "https://example.com/product1",
      "https://example.com/product2"
    ],
    "options": {
      "concurrency": 2,
      "delayBetweenRequests": 1000
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Products scraped successfully",
    "products": [
      {
        "name": "Product 1",
        "price": 99.99,
        "thumbnail": "url_to_thumbnail",
        "site": "example.com",
        "url": "https://example.com/product1",
        "scrapingStatus": {
          "isComplete": true,
          "warnings": [],
          "siteSupported": true
        }
      },
      {
        "name": "Product 2",
        "price": 149.99,
        "thumbnail": "url_to_thumbnail",
        "site": "example.com",
        "url": "https://example.com/product2",
        "scrapingStatus": {
          "isComplete": true,
          "warnings": [],
          "siteSupported": true
        }
      }
    ]
  }
  ```

#### Validate URL
- **Endpoint**: `POST /api/scrape/validate`
- **Description**: Checks if a URL is likely a product page
- **Headers**: `Authorization: Bearer token`
- **Request Body**:
  ```json
  {
    "url": "https://example.com/product"
  }
  ```
- **Response**:
  ```json
  {
    "url": "https://example.com/product",
    "domain": "example.com",
    "isValid": true,
    "message": "URL appears to be a valid product page"
  }
  ```

### Wishlist Operations

#### Get Wishlist
- **Endpoint**: `GET /api/wishlist`
- **Description**: Gets all wishlist items for the current user
- **Headers**: `Authorization: Bearer token`
- **Response**:
  ```json
  {
    "items": [
      {
        "_id": "item_id",
        "name": "Product Name",
        "price": 99.99,
        "originalPrice": 129.99,
        "currency": "USD",
        "thumbnail": "url_to_thumbnail",
        "url": "product_url",
        "site": "amazon",
        "description": "Product description",
        "notes": "My notes",
        "priority": "high",
        "status": "active",
        "addedAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-02T00:00:00Z"
      }
    ],
    "count": 1
  }
  ```

#### Add Item
- **Endpoint**: `POST /api/wishlist`
- **Description**: Adds a new item to the wishlist
- **Headers**: `Authorization: Bearer token`
- **Request Body**:
  ```json
  {
    "url": "https://example.com/product",
    "manualDetails": {
      "name": "Custom Name",
      "price": 99.99,
      "description": "Custom description"
    }
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Item added successfully",
    "item": {
      "_id": "item_id",
      "name": "Product Name",
      "price": 99.99,
      "thumbnail": "url_to_thumbnail",
      "url": "https://example.com/product",
      "site": "example.com",
      "status": "active",
      "addedAt": "2023-01-01T00:00:00Z"
    },
    "scrapingStatus": {
      "isComplete": true,
      "warnings": [],
      "siteSupported": true
    }
  }
  ```

#### Get Item
- **Endpoint**: `GET /api/wishlist/{id}`
- **Description**: Gets a specific wishlist item
- **Headers**: `Authorization: Bearer token`
- **Response**: Item object

#### Update Item
- **Endpoint**: `PUT /api/wishlist/{id}`
- **Description**: Updates a wishlist item with re-scraping
- **Headers**: `Authorization: Bearer token`
- **Request Body**:
  ```json
  {
    "url": "https://example.com/product"
  }
  ```
- **Response**: Updated item object

#### Patch Item
- **Endpoint**: `PATCH /api/wishlist/{id}`
- **Description**: Updates specific fields of a wishlist item without re-scraping
- **Headers**: `Authorization: Bearer token`
- **Request Body**:
  ```json
  {
    "notes": "My updated notes",
    "priority": "high"
  }
  ```
- **Response**: Updated item object

#### Delete Item
- **Endpoint**: `DELETE /api/wishlist/{id}`
- **Description**: Deletes a wishlist item
- **Headers**: `Authorization: Bearer token`
- **Response**: Success message

## Client Usage Examples

### Authentication

```javascript
// Login
const loginResult = await auth.login(email, password);
const { token, refreshToken, user } = loginResult;

// Signup
const signupResult = await auth.signup(email, password, username);

// Refresh token
const refreshResult = await auth.refreshToken(refreshToken);
```

### User Management

```javascript
// Get user profile
const profile = await user.getProfile();

// Update profile
await user.updateProfile({
  displayName: 'New Name',
  bio: 'My new bio'
});

// Delete account
await user.deleteAccount();
```

### Scraping Operations

```javascript
// Scrape a URL without saving to wishlist
const { product } = await scraper.scrapeUrl('https://example.com/product');
console.log(product.name, product.price);

// Check if scraping was complete
if (!product.scrapingStatus.isComplete) {
  console.warn('Incomplete data:', product.scrapingStatus.warnings);
}

// Batch scrape multiple URLs
const { products } = await scraper.batchScrape([
  'https://example.com/product1',
  'https://example.com/product2'
], {
  concurrency: 2,
  delayBetweenRequests: 1000
});

// Validate if a URL is likely a product page
const { isValid, domain } = await scraper.validateUrl('https://example.com/product');
if (isValid) {
  console.log(`Valid product URL from ${domain}`);
} else {
  console.warn('Not a valid product URL');
}
```

### Wishlist Operations

```javascript
// Get wishlist items
const { items, count } = await wishlist.getItems();

// Add item to wishlist
const newItem = await wishlist.addItem({ 
  url: 'https://example.com/product',
  // Optional manual details that override scraped data
  manualDetails: {
    name: 'Custom Product Name',
    price: 99.99
  }
});

// Get specific item
const item = await wishlist.getItem(itemId);

// Update item (re-scrape)
const updatedItem = await wishlist.updateItem(itemId, { 
  url: 'https://example.com/product',
  manualDetails: {
    notes: 'Birthday gift idea'
  }
});

// Update item fields (no re-scrape)
const patchedItem = await wishlist.patchItem(itemId, { 
  notes: 'Birthday gift idea',
  priority: 'high',
  status: 'purchased'
});

// Delete item from wishlist
await wishlist.deleteItem(itemId);
```

## Error Handling

All API functions use consistent error handling. Errors will include:

- `status`: HTTP status code
- `message`: Error message
- `data`: Additional error data from the server (if available)

Example error handling:

```javascript
try {
  await auth.login(email, password);
} catch (error) {
  if (error.status === 401) {
    // Handle unauthorized
  } else if (error.status === 400) {
    // Handle validation errors
  } else if (error.status === 429) {
    // Handle rate limiting
    const retryAfter = error.headers?.get('Retry-After');
    console.log(`Too many requests. Try again in ${retryAfter} seconds`);
  } else {
    // Handle other errors
  }
}
```

## Rate Limiting

The API implements rate limiting to protect against abuse:

- Authentication endpoints: 10 requests per minute
- Standard API endpoints: 60 requests per minute
- Public endpoints: 120 requests per minute

When rate limits are exceeded, the API will return a 429 status code with a Retry-After header indicating when to try again.