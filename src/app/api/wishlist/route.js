import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { getSession } from '../../../lib/auth';
import logger from '../../../lib/logger';
import { errorResponse, successResponse } from '../../../lib/apiUtils';

export const dynamic = 'force-dynamic'; // Ensure route is not cached

export async function GET(req) {
  try {
    await connectDB();
    const session = await getSession(req);
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await User.findById(session.userId, 'wishlist');
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    return successResponse({ 
      items: user.wishlist,
      count: user.wishlist.length
    });
  } catch (error) {
    logger.error('Error fetching wishlist:', error);
    return errorResponse('Failed to fetch wishlist', 500);
  }
}

export async function POST(req) {
  try {
    await connectDB();
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

    const { url, manualDetails = {} } = body;
    if (!url) {
      return errorResponse('URL is required', 400);
    }
    
    const { scrapeProductDetails } = await import('../../../lib/scraper');
    
    try {
      // Configure scraping options
      const scrapingOptions = {
        allowPartialResults: true,
        timeout: 30000, // Increased timeout
        retries: 2,     // Add retry attempts
        useProxy: false, // Not using proxy for now, but could be enabled in the future
        onStatusUpdate: (message, type) => {
          // This function won't be used directly in the API route,
          // but it's included for completeness and future use
          logger.info(`Scraping status: ${message} (${type})`);
        }
      };
      
      // Attempt to scrape product details
      const scrapedDetails = await scrapeProductDetails(url, scrapingOptions);
      const user = await User.findById(session.userId);
      
      if (!user) {
        return errorResponse('User not found', 404);
      }
      
      // Extract scraping status
      const { scrapingStatus, ...productDetails } = scrapedDetails;
      
      // Merge scraped details with any manual details provided by the user
      // Manual details take precedence over scraped details
      const mergedDetails = {
        ...productDetails,
        ...manualDetails,
        // Always keep the original URL and scraping timestamp
        url,
        scrapedAt: new Date().toISOString()
      };
      
      // Create the new wishlist item
      const newItem = { 
        ...mergedDetails,
        clientId: new Date().getTime().toString(), // Use for client-side identification only
        addedAt: new Date()
      };
      
      // Add to wishlist and save
      user.wishlist.push(newItem);
      await user.save();
      
      // Return the saved item with its MongoDB-generated _id and scraping status
      const savedItem = user.wishlist[user.wishlist.length - 1];
      return successResponse({ 
        message: 'Item added successfully', 
        item: savedItem,
        scrapingStatus
      }, 201);
    } catch (error) {
      logger.error('Error scraping product:', error);
      
      // Check for rate limiting or blocking errors
      if (error.isAxiosError && error.response && (error.response.status === 429 || error.response.status === 529)) {
        return errorResponse(
          'This website is currently blocking our automatic product detection. ' +
          'Please try again later or provide manual details.', 
          429
        );
      } else if (error.message && (
          error.message.includes('Rate limited') || 
          error.message.includes('Access denied') ||
          error.message.includes('HTTP 529') ||
          error.message.includes('maxRedirects')
      )) {
        return errorResponse(
          'This website is currently blocking our automatic product detection. ' +
          'Please try again later or provide manual details.', 
          429
        );
      }
      
      // If the user provided manual details, we can still add the item
      // even if scraping failed completely
      if (Object.keys(manualDetails).length > 0 && manualDetails.name) {
        try {
          const user = await User.findById(session.userId);
          
          if (!user) {
            return errorResponse('User not found', 404);
          }
          
          // Create a minimal item with manual details
          const newItem = { 
            url,
            name: manualDetails.name,
            price: manualDetails.price || 0,
            thumbnail: manualDetails.thumbnail || '',
            description: manualDetails.description || '',
            site: new URL(url).hostname.replace('www.', ''),
            scrapedAt: new Date().toISOString(),
            clientId: new Date().getTime().toString(),
            addedAt: new Date()
          };
          
          // Add to wishlist and save
          user.wishlist.push(newItem);
          await user.save();
          
          // Return the saved item with a warning
          const savedItem = user.wishlist[user.wishlist.length - 1];
          return successResponse({ 
            message: 'Item added with manual details. Automatic scraping failed.', 
            item: savedItem,
            scrapingStatus: {
              isComplete: false,
              warnings: [error.message || 'Failed to scrape product details'],
              siteSupported: false
            }
          }, 201);
        } catch (saveError) {
          logger.error('Error saving manual item:', saveError);
          return errorResponse('Failed to add item with manual details', 500);
        }
      }
      
      // If no manual details or scraping failed completely
      return errorResponse(error.message || 'Failed to scrape product', 500);
    }
  } catch (error) {
    logger.error('Error adding item to wishlist:', error);
    return errorResponse('Failed to add item to wishlist', 500);
  }
}