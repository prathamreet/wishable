import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import { errorResponse, successResponse } from '../../../../lib/apiUtils';
import { withRateLimit, rateLimits } from '../../../../lib/rateLimit';

export const dynamic = 'force-dynamic'; // Never cache this route

// Apply rate limiting to the GET handler
const handler = async (req) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    await connectDB();
    const user = await User.findById(decoded.userId).select('_id username lastActive');
    
    if (!user) {
      return errorResponse('User not found', 401);
    }
    
    // Update last active timestamp
    await User.findByIdAndUpdate(user._id, { 
      lastActive: new Date() 
    });
    
    // Token is valid
    return successResponse({ 
      valid: true, 
      userId: user._id,
      username: user.username
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return errorResponse('Invalid token', 401);
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return errorResponse('Token expired', 401);
    }
    
    console.error('Token verification error:', error);
    return errorResponse('Authentication failed', 500);
  }
};

// Wrap the handler with a try-catch to ensure we always return a Response
const safeHandler = async (req, ...args) => {
  try {
    return await handler(req, ...args);
  } catch (error) {
    console.error('Unhandled error in verify handler:', error);
    return errorResponse('Authentication failed', 500);
  }
};

export const GET = withRateLimit(safeHandler, rateLimits.api);