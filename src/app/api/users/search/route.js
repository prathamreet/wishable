import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import logger from '../../../../lib/logger';
import { errorResponse, successResponse, cacheOptions } from '../../../../lib/apiUtils';

export const dynamic = 'force-dynamic'; // Do not cache this route

export async function GET(request) {
  console.time('user-search-execution');
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      console.timeEnd('user-search-execution');
      return errorResponse('Username is required', 400);
    }
    
    // Connect to DB
    await connectDB();
    console.timeLog('user-search-execution', 'DB connected');
    
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
    
    console.timeLog('user-search-execution', 'Search completed');
    
    if (!user) {
      console.timeEnd('user-search-execution');
      return errorResponse('User not found', 404);
    }
    
    // Return minimal data to reduce payload size
    console.timeEnd('user-search-execution');
    return successResponse({
      user: {
        username: user.username,
        slug: user.slug
      }
    }, 200, cacheOptions.SHORT); // Cache for a short time (5 minutes)
  } catch (error) {
    console.timeEnd('user-search-execution');
    logger.error('User search error:', error);
    return errorResponse('Server error', 500);
  }
} 