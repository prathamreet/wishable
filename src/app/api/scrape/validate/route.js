import { getSession } from '../../../../lib/auth';
import logger from '../../../../lib/logger';
import { errorResponse, successResponse } from '../../../../lib/apiUtils';
import { withRateLimit } from '../../../../lib/rateLimit';

export const dynamic = 'force-dynamic'; // Ensure route is not cached

/**
 * POST - Validate if a URL is likely a product page
 * This is a lightweight endpoint that doesn't actually scrape the page
 */
async function POST(req) {
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
    
    // Validate URL format
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      return errorResponse('Invalid URL format', 400);
    }
    
    // Import scraper function dynamically
    const { isLikelyProductUrl } = await import('../../../../lib/scraper');
    
    // Check if URL is likely a product page
    const isProductUrl = isLikelyProductUrl(url);
    
    // Get domain for site-specific information
    const domain = urlObj.hostname.replace('www.', '');
    
    // Return validation result
    return successResponse({ 
      url,
      domain,
      isValid: isProductUrl,
      message: isProductUrl 
        ? 'URL appears to be a valid product page' 
        : 'URL does not appear to be a product page'
    });
  } catch (error) {
    logger.error('Error validating URL:', error);
    return errorResponse(error.message || 'Failed to validate URL', 500);
  }
}

// Apply rate limiting to the handler
export const POST = withRateLimit(POST, {
  limit: 30,
  windowMs: 60 * 1000, // 1 minute
});