import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../../../../lib/logger';
import { errorResponse, successResponse } from '../../../../lib/apiUtils';
import { withRateLimit, rateLimits } from '../../../../lib/rateLimit';

export const dynamic = 'force-dynamic'; // Never cache this route

// Apply rate limiting to the POST handler
const handler = async (req) => {
  console.time('login-execution');
  try {
    // Connect to the database first
    await connectDB();
    console.timeLog('login-execution', 'DB connected');
    
    // Parse request body
    let body;
    try {
      const clonedReq = req.clone(); // Clone the request to avoid body already read error
      body = await clonedReq.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return errorResponse('Invalid request body', 400);
    }
    
    const { email, password } = body || {};

    // Validate required fields
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    console.timeLog('login-execution', 'Validation complete');

    // Find user by email - only select fields we need
    const user = await User.findOne({ email }).select('_id password username slug displayName profilePicture settings');
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    console.timeLog('login-execution', 'User found');

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Use same error message for security (don't reveal if email exists)
      return errorResponse('Invalid email or password', 401);
    }

    console.timeLog('login-execution', 'Password verified');

    // Update last active timestamp
    await User.findByIdAndUpdate(user._id, { 
      lastActive: new Date() 
    });

    // Generate JWT token with appropriate expiration
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        version: 1 // For token versioning if needed for invalidation
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Generate refresh token with longer expiration
    const refreshToken = jwt.sign(
      { 
        userId: user._id,
        tokenType: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );
    
    console.timeEnd('login-execution');
    
    return successResponse({ 
      token,
      refreshToken,
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
    console.timeEnd('login-execution');
    logger.error('Login error:', error);
    return errorResponse('Authentication failed', 500);
  }
};

// Export the rate-limited handler
// Wrap the handler with a try-catch to ensure we always return a Response
const safeHandler = async (req, ...args) => {
  try {
    return await handler(req, ...args);
  } catch (error) {
    console.error('Unhandled error in login handler:', error);
    return errorResponse('Authentication failed', 500);
  }
};

export const POST = withRateLimit(safeHandler, rateLimits.auth);