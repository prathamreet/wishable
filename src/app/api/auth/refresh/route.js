import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import logger from '../../../../lib/logger';
import { errorResponse, successResponse } from '../../../../lib/apiUtils';

export const dynamic = 'force-dynamic'; // Never cache this route

export async function POST(req) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return errorResponse('Invalid request body', 400);
    }
    
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse('Refresh token is required', 400);
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse('Refresh token has expired', 401);
      }
      return errorResponse('Invalid refresh token', 401);
    }

    // Check if it's actually a refresh token
    if (!decoded.tokenType || decoded.tokenType !== 'refresh') {
      return errorResponse('Invalid token type', 401);
    }

    // Connect to database and get user
    await connectDB();
    const user = await User.findById(decoded.userId).select('_id username slug displayName profilePicture settings');
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Update last active timestamp
    await User.findByIdAndUpdate(user._id, { 
      lastActive: new Date() 
    });

    // Generate new access token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        version: 1 // For token versioning if needed for invalidation
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { 
        userId: user._id,
        tokenType: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );
    
    return successResponse({ 
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        username: user.username,
        slug: user.slug,
        displayName: user.displayName || user.username,
        profilePicture: user.profilePicture,
        theme: user.settings?.theme || 'system'
      },
      expiresIn: 30 * 24 * 60 * 60 // 30 days in seconds
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    return errorResponse('Failed to refresh token', 500);
  }
}