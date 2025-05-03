# Wishable Product Scraper

The Wishable Product Scraper is a robust, flexible system for extracting product information from e-commerce websites. It's designed to handle a wide variety of sites and gracefully manage partial results when complete information isn't available.

## Features

- **Multi-site support**: Works with 30+ popular e-commerce sites out of the box
- **Fallback strategies**: Multiple extraction methods ensure maximum data retrieval
- **Partial results**: Can return partial data when complete information isn't available
- **Structured data extraction**: Leverages JSON-LD and other structured data when available
- **Batch processing**: Efficiently scrape multiple URLs with rate limiting
- **URL validation**: Quickly check if a URL is likely a product page
- **Detailed status reporting**: Get warnings and status information about the scraping process


## API

### Main Functions

#### `scrapeProductDetails(url, options)`

Scrapes product details from a URL.

**Parameters:**
- `url` (string): The URL to scrape
- `options` (object, optional):
  - `allowPartialResults` (boolean): Whether to return partial results if some fields are missing (default: true)
  - `timeout` (number): Request timeout in milliseconds (default: 20000)

**Returns:** Object with product details and scraping status:
```javascript
{
  name: "Product Name",
  price: 99.99,
  thumbnail: "https://example.com/image.jpg",
  description: "Product description",
  site: "amazon.com",
  scrapedAt: "2023-05-15T12:34:56.789Z",
  url: "https://amazon.com/dp/...",
  // Game-specific metadata (only for gaming sites)
  gameMetadata: {
    genre: "RPG, Adventure",
    platform: "PC, PlayStation 5, Xbox Series X",
    publisher: "Publisher Name",
    developer: "Developer Studio",
    releaseDate: "2023-05-15"
  },
  scrapingStatus: {
    isComplete: true,
    warnings: [],
    siteSupported: true
  }
}
```

Note: The `gameMetadata` field is only included for products from gaming sites.

#### `batchScrapeProducts(urls, options)`

Scrapes multiple product URLs in parallel with rate limiting.

**Parameters:**
- `urls` (array): Array of URLs to scrape
- `options` (object, optional):
  - `concurrency` (number): Number of concurrent requests (default: 2)
  - `delayBetweenRequests` (number): Delay between requests in ms (default: 1000)
  - `allowPartialResults` (boolean): Whether to return partial results (default: true)
  - `timeout` (number): Request timeout in milliseconds (default: 20000)

**Returns:** Array of product details objects

#### `isLikelyProductUrl(url)`

Checks if a URL is likely to be a product page.

**Parameters:**
- `url` (string): URL to check

**Returns:** Boolean indicating if the URL is likely a product page

## Supported Sites

The scraper has specific selectors for these sites, but can work with many others:

### Major Marketplaces
- Amazon
- Walmart
- Target
- Best Buy
- eBay
- Newegg

### Fashion & Apparel
- ASOS
- Zara
- H&M
- Myntra
- AJIO

### Electronics
- Apple
- Samsung
- Dell
- HP
- Lenovo

### Gaming Platforms & Stores
- Steam
- Epic Games Store
- GOG
- Nintendo eShop
- PlayStation Store
- Xbox Store
- Humble Bundle
- Green Man Gaming
- Fanatical
- CDKeys
- GamersGate
- Games The Shop

### And many more!

## Usage Examples

### Basic Scraping

```javascript
import { scrapeProductDetails } from './lib/scraper';

const details = await scrapeProductDetails('https://www.amazon.com/dp/B09JQSLL92/');
console.log(details);
```

### Scraping with Options

```javascript
const details = await scrapeProductDetails(url, {
  allowPartialResults: true,
  timeout: 20000
});

// Check if scraping was complete
if (!details.scrapingStatus.isComplete) {
  console.warn('Incomplete data:', details.scrapingStatus.warnings);
}
```

### Batch Scraping

```javascript
import { batchScrapeProducts } from './lib/scraper';

const urls = [
  'https://www.amazon.com/dp/B09JQSLL92/',
  'https://www.bestbuy.com/site/apple-airpods-pro-2nd-generation-white/4900964.p'
];

const results = await batchScrapeProducts(urls, {
  concurrency: 2,
  delayBetweenRequests: 1000
});
```

### URL Validation

```javascript
import { isLikelyProductUrl } from './lib/scraper';

const isValid = isLikelyProductUrl('https://www.amazon.com/dp/B09JQSLL92/');
// Returns true
```

## Special Features

### Gaming Site Support

The scraper has enhanced support for gaming sites with special features:

1. **Game Metadata Extraction**: For gaming sites, the scraper attempts to extract additional metadata:
   - Genre
   - Platform/Operating System
   - Publisher
   - Developer
   - Release Date

2. **Free Game Detection**: The scraper can detect when a game is free and set the price to 0.

3. **Sale Price Detection**: For games on sale, the scraper prioritizes finding the discounted price.

4. **Gaming-Specific URL Patterns**: The URL validator recognizes patterns specific to gaming sites like Steam's `/app/` format.

### Example of Game Scraping

```javascript
const gameDetails = await scrapeProductDetails('https://store.steampowered.com/app/1551360/Baldurs_Gate_3/');
console.log(gameDetails.name); // "Baldur's Gate 3"
console.log(gameDetails.gameMetadata.genre); // "RPG"
console.log(gameDetails.gameMetadata.developer); // "Larian Studios"
```

## Error Handling

The scraper provides detailed error messages for common issues:

- Access denied (HTTP 403)
- Product not found (HTTP 404)
- Rate limited (HTTP 429)
- Request timeout
- Domain not found
- General scraping errors

When `allowPartialResults` is enabled, the scraper will return as much data as it can extract, with warnings about missing fields.

## Extending

To add support for a new site, add its selectors to the `siteSpecificSelectors` object:

```javascript
'newsite': {
  name: ['.product-title', '.title'],
  price: ['.product-price', '.price'],
  image: ['.product-image', '.main-image']
}
```

## API Endpoints

The scraper is exposed through these API endpoints:

- `POST /api/scrape` - Scrape a single URL
- `POST /api/scrape?batch=true` - Batch scrape multiple URLs
- `POST /api/scrape/validate` - Check if a URL is a valid product page