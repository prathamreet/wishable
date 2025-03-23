import { successResponse, errorResponse, cacheOptions } from '../../../../lib/apiUtils';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import logger from '../../../../lib/logger';

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    // Find user by slug, excluding sensitive information
    const user = await User.findOne(
      { slug: params.slug }, 
      'username slug displayName wishlist profilePicture address.city address.state address.country'
    ).lean();
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    // Public profiles can be cached for a short period
    return successResponse(user, 200, cacheOptions.SHORT);
  } catch (error) {
    logger.error('Profile fetch error:', error);
    return errorResponse('Internal server error', 500, error);
  }
} 