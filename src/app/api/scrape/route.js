import { getSession } from '../../../lib/auth';
import logger from '../../../lib/logger';
import { errorResponse, successResponse } from '../../../lib/apiUtils';
import { withRateLimit, rateLimits } from '../../../lib/rateLimit';

export const dynamic = 'force-dynamic'; // Ensure route is not cached

/**
 * Handler for scraping product details from a URL without saving to wishlist
 * This endpoint allows the frontend to preview product details before adding to wishlist
 */
async function handleScrapeRequest(req) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return errorResponse('Invalid request body', 400);
    }

    const { url } = body;
    if (!url) {
      return errorResponse('URL is required', 400);
    }
    
    // Import scraper dynamically to reduce initial load time
    const { scrapeProductDetails, isLikelyProductUrl } = await import('../../../lib/scraper');
    
    // Check if URL is likely a product page
    if (!isLikelyProductUrl(url)) {
      return errorResponse('URL does not appear to be a product page. Please check the URL and try again.', 400);
    }
    
    // Configure scraping options
    const scrapingOptions = {
      allowPartialResults: true,
      timeout: 20000
    };
    
    // Attempt to scrape product details
    const scrapedDetails = await scrapeProductDetails(url, scrapingOptions);
    
    // Return the scraped details
    return successResponse({ 
      message: 'Product details scraped successfully',
      product: scrapedDetails
    });
  } catch (error) {
    logger.error('Error scraping product:', error);
    return errorResponse(error.message || 'Failed to scrape product', 500);
  }
}

/**
 * Handler for batch scraping multiple URLs
 * This endpoint allows the frontend to scrape multiple URLs at once
 */
async function handleBatchScrapeRequest(req) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return errorResponse('Invalid request body', 400);
    }

    const { urls, options = {} } = body;
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return errorResponse('URLs array is required', 400);
    }
    
    // Limit the number of URLs that can be scraped at once
    if (urls.length > 10) {
      return errorResponse('Maximum of 10 URLs can be scraped at once', 400);
    }
    
    // Import scraper dynamically to reduce initial load time
    const { batchScrapeProducts } = await import('../../../lib/scraper');
    
    // Configure scraping options
    const scrapingOptions = {
      concurrency: 2,
      delayBetweenRequests: 1000,
      allowPartialResults: true,
      timeout: 15000,
      ...options
    };
    
    // Attempt to scrape product details
    const scrapedDetails = await batchScrapeProducts(urls, scrapingOptions);
    
    // Return the scraped details
    return successResponse({ 
      message: 'Products scraped successfully',
      products: scrapedDetails
    });
  } catch (error) {
    logger.error('Error batch scraping products:', error);
    return errorResponse(error.message || 'Failed to scrape products', 500);
  }
}

// Apply rate limiting to the handlers
const handler = async (req) => {
  // Check if it's a batch request
  const url = new URL(req.url);
  if (url.searchParams.get('batch') === 'true') {
    return handleBatchScrapeRequest(req);
  }
  return handleScrapeRequest(req);
};

// Apply stricter rate limits for scraping endpoints
export const POST = withRateLimit(handler, {
  limit: 20,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `scrape:${ip}`;
  }
});