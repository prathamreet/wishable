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

    const { url } = body;
    if (!url) {
      return errorResponse('URL is required', 400);
    }
    
    const { scrapeProductDetails } = await import('../../../lib/scraper');
    
    try {
      const details = await scrapeProductDetails(url);
      const user = await User.findById(session.userId);
      
      if (!user) {
        return errorResponse('User not found', 404);
      }
      
      // Let MongoDB handle the _id field automatically
      const newItem = { 
        url, 
        ...details,
        clientId: new Date().getTime().toString(), // Use for client-side identification only
        addedAt: new Date()
      };
      
      // Add to wishlist and save
      user.wishlist.push(newItem);
      await user.save();
      
      // Return the saved item with its MongoDB-generated _id
      const savedItem = user.wishlist[user.wishlist.length - 1];
      return successResponse({ 
        message: 'Item added successfully', 
        item: savedItem 
      }, 201);
    } catch (error) {
      logger.error('Error scraping product:', error);
      return errorResponse(error.message || 'Failed to scrape product', 500);
    }
  } catch (error) {
    logger.error('Error adding item to wishlist:', error);
    return errorResponse('Failed to add item to wishlist', 500);
  }
}