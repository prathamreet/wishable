import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import logger from '../../../../lib/logger';
import { errorResponse, successResponse } from '../../../../lib/apiUtils';
import { withRateLimit, rateLimits } from '../../../../lib/rateLimit';

export const dynamic = 'force-dynamic'; // Never cache this route

// Apply rate limiting to the POST handler
const handler = async (req) => {
  // Verify environment variables first
  if (!process.env.MONGODB_URI) {
    logger.error('MONGODB_URI is not defined in environment variables');
    return errorResponse('Server configuration error: Database connection string missing', 500);
  }
  
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET is not defined in environment variables');
    return errorResponse('Server configuration error: JWT secret missing', 500);
  }
  
  try {
    // Parse request body
    let body;
    try {
      const clonedReq = req.clone(); // Clone the request to avoid body already read error
      body = await clonedReq.json();
    } catch (e) {
      logger.error('Error parsing request body:', e);
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

    // Connect to the database after validation
    try {
      await connectDB();
    } catch (dbError) {
      logger.error('Database connection error:', dbError);
      
      // Check for the specific test database in production error
      if (dbError.message && dbError.message.includes('test database in production')) {
        // This is a Vercel preview environment issue - allow it to proceed with fallback
        try {
          const uri = process.env.MONGODB_URI + '/' + (process.env.MONGODB_DB_NAME || 'wishable_test');
          await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 60000,
            family: 4
          });
        } catch (retryError) {
          logger.error('Failed to connect even with direct connection:', retryError);
          return errorResponse('Failed to connect to database', 500);
        }
      } else {
        return errorResponse('Failed to connect to database', 500);
      }
    }
    
    // Check for existing email and username in parallel
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a slug from username
    let slug = username.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let uniqueSlug = slug;
    
    // Check for existing slug
    const existingSlug = await User.findOne({ slug }).select('_id').lean();
    if (existingSlug) {
      // Append a portion of a timestamp to make it unique
      uniqueSlug = `${slug}-${Date.now().toString().slice(-6)}`;
    }

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      slug: uniqueSlug,
      createdAt: new Date()
    });
    
    await newUser.save();

    // Generate tokens
    const token = jwt.sign(
      { 
        userId: newUser._id,
        username: newUser.username,
        version: 1 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    const refreshToken = jwt.sign(
      { 
        userId: newUser._id,
        tokenType: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );
    
    // Return success response
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
    logger.error('Signup error:', error);
    return errorResponse('Failed to create account', 500);
  }
};

// Wrap the handler with a try-catch to ensure we always return a Response
const safeHandler = async (req, ...args) => {
  try {
    return await handler(req, ...args);
  } catch (error) {
    logger.error('Unhandled error in signup handler:', error);
    
    if (error.message && error.message.includes('JWT')) {
      return errorResponse('Authentication token generation failed', 500);
    }
    
    if (error.message && (error.message.includes('MongoDB') || error.message.includes('mongo'))) {
      return errorResponse('Database operation failed', 500);
    }
    
    return errorResponse('Failed to create account', 500);
  }
};

export const POST = withRateLimit(safeHandler, rateLimits.auth);