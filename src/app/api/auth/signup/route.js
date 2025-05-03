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
  console.time('signup-execution');
  try {
    // Connect to the database first
    await connectDB();
    console.timeLog('signup-execution', 'DB connected');
    
    // Parse request body
    let body;
    try {
      const clonedReq = req.clone(); // Clone the request to avoid body already read error
      body = await clonedReq.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return errorResponse('Invalid request body', 400);
    }
    
    const { email, password, username } = body;

    // Validate required fields
    if (!email || !password || !username) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    // Validate username (3-30 characters, alphanumeric and hyphens)
    if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9-_]+$/.test(username)) {
      return errorResponse('Username must be 3-30 characters and can only contain letters, numbers, hyphens and underscores', 400);
    }

    console.timeLog('signup-execution', 'Validation complete');

    // Check for existing email and username in parallel to save time
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email }).select('_id').lean(),
      User.findOne({ username }).select('_id').lean()
    ]);

    if (existingEmail) {
      return errorResponse('User already exists with this email', 400);
    }

    if (existingUsername) {
      return errorResponse('Username already taken', 400);
    }

    console.timeLog('signup-execution', 'Uniqueness check complete');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.timeLog('signup-execution', 'Password hashed');

    // Generate a slug from username
    let slug = username.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let uniqueSlug = slug;
    let counter = 1;
    
    // Check for existing slug
    const existingSlug = await User.findOne({ slug }).select('_id').lean();
    if (existingSlug) {
      // Get count of similar slugs to avoid repeated DB queries
      const similarSlugs = await User.find({
        slug: new RegExp(`^${slug}-\\d+$`)
      }).select('slug').lean();
      
      // Find the highest number suffix used
      if (similarSlugs.length > 0) {
        const suffixes = similarSlugs
          .map(s => {
            const match = s.slug.match(new RegExp(`^${slug}-(\\d+)$`));
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(n => !isNaN(n));
        
        counter = suffixes.length > 0 ? Math.max(...suffixes) + 1 : 1;
      }
      
      uniqueSlug = `${slug}-${counter}`;
    }

    console.timeLog('signup-execution', 'Slug generated');

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      slug: uniqueSlug,
      createdAt: new Date()
    });
    
    await newUser.save();
    console.timeLog('signup-execution', 'User saved');

    // Generate JWT token with appropriate expiration
    const token = jwt.sign(
      { 
        userId: newUser._id,
        username: newUser.username,
        version: 1 // For token versioning if needed for invalidation
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Generate refresh token with longer expiration
    const refreshToken = jwt.sign(
      { 
        userId: newUser._id,
        tokenType: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );
    
    console.timeEnd('signup-execution');
    
    return successResponse({ 
      token,
      refreshToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        slug: newUser.slug,
        displayName: newUser.username
      },
      expiresIn: 30 * 24 * 60 * 60 // 30 days in seconds
    }, 201);
  } catch (error) {
    console.timeEnd('signup-execution');
    logger.error('Signup error:', error);
    
    // Check for specific MongoDB errors
    if (error.name === 'MongoServerError' && error.code === 11000) {
      // Duplicate key error
      if (error.keyPattern.email) {
        return errorResponse('Email already in use', 400);
      }
      if (error.keyPattern.username) {
        return errorResponse('Username already taken', 400);
      }
      if (error.keyPattern.slug) {
        return errorResponse('Slug already exists', 400);
      }
    }
    
    return errorResponse('Failed to create account', 500);
  }
};

// Wrap the handler with a try-catch to ensure we always return a Response
const safeHandler = async (req, ...args) => {
  try {
    return await handler(req, ...args);
  } catch (error) {
    console.error('Unhandled error in signup handler:', error);
    return errorResponse('Failed to create account', 500);
  }
};

export const POST = withRateLimit(safeHandler, rateLimits.auth);