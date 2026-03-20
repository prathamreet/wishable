import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import logger from '../../../../lib/logger';
import { errorResponse, successResponse, cacheOptions } from '../../../../lib/apiUtils';

export const dynamic = 'force-dynamic'; // Do not cache this route

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return errorResponse('Username is required', 400);
    }
    
    // Connect to DB
    await connectDB();
    
    // Optimize query to only select necessary fields
    // First try exact match (most efficient)
    let user = await User.findOne(
      { username: username },
      'username slug'
    ).lean().exec();
    
    // If not found, try case-insensitive match
    if (!user) {
      try {
        // Only use regex if absolutely necessary 
        // and keep it efficient with anchored query (^$)
        user = await User.findOne(
          { username: { $regex: new RegExp(`^${username}$`, 'i') } },
          'username slug'
        ).lean().maxTimeMS(3000).exec();
      } catch (regexError) {
        // Handle potential regex errors
        logger.error('Regex search error:', regexError);
      }
    }
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    // Return minimal data to reduce payload size
    return successResponse({
      user: {
        username: user.username,
        slug: user.slug
      }
    }, 200, cacheOptions.SHORT); // Cache for a short time (5 minutes)
  } catch (error) {
    logger.error('User search error:', error);
    return errorResponse('Server error', 500);
  }
}