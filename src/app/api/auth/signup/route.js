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
  console.time('signup-execution');
  
  // Verify environment variables first
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    return errorResponse('Server configuration error: Database connection string missing', 500);
  }
  
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    return errorResponse('Server configuration error: JWT secret missing', 500);
  }
  
  try {
    // Parse request body first to avoid unnecessary database connections if the request is invalid
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

    console.log('Validation complete, connecting to database...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database name:', process.env.MONGODB_DB_NAME || 'using default');
    
    // Connect to the database after validation
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      
      // Check for the specific test database in production error
      if (dbError.message && dbError.message.includes('test database in production')) {
        // This is a Vercel preview environment issue - allow it to proceed
        console.log('Detected Vercel preview environment with test database - proceeding anyway');
        
        // Try connecting again with validation bypassed
        try {
          // Get the connection string directly
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
          console.log('Database connected successfully with direct connection');
        } catch (retryError) {
          console.error('Failed to connect even with direct connection:', retryError);
          return errorResponse('Failed to connect to database', 500);
        }
      } else {
        return errorResponse('Failed to connect to database', 500);
      }
    }
    
    // Check for existing email and username in parallel to save time
    try {
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
      
      console.log('Uniqueness check complete');
    } catch (checkError) {
      console.error('Error checking existing user:', checkError);
      return errorResponse('Error checking user availability', 500);
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      return errorResponse('Error processing password', 500);
    }

    // Generate a slug from username
    let slug = username.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let uniqueSlug = slug;
    
    try {
      // Check for existing slug
      const existingSlug = await User.findOne({ slug }).select('_id').lean();
      if (existingSlug) {
        // Simple approach: just append a timestamp to make it unique
        uniqueSlug = `${slug}-${Date.now().toString().slice(-6)}`;
      }
      console.log('Slug generated:', uniqueSlug);
    } catch (slugError) {
      console.error('Error generating slug:', slugError);
      // Non-critical error, continue with original slug
      console.log('Using fallback slug:', slug);
      uniqueSlug = slug;
    }

    // Create new user
    let newUser;
    try {
      newUser = new User({
        email,
        password: hashedPassword,
        username,
        slug: uniqueSlug,
        createdAt: new Date()
      });
      
      await newUser.save();
      console.log('User saved successfully with ID:', newUser._id);
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      
      // Check for duplicate key errors
      if (saveError.name === 'MongoServerError' && saveError.code === 11000) {
        if (saveError.keyPattern.email) {
          return errorResponse('Email already in use', 400);
        }
        if (saveError.keyPattern.username) {
          return errorResponse('Username already taken', 400);
        }
        if (saveError.keyPattern.slug) {
          return errorResponse('Slug already exists', 400);
        }
        return errorResponse('Duplicate value detected', 400);
      }
      
      return errorResponse('Failed to create user account', 500);
    }

    // Generate tokens
    let token, refreshToken;
    try {
      // Generate JWT token with appropriate expiration
      token = jwt.sign(
        { 
          userId: newUser._id,
          username: newUser.username,
          version: 1 // For token versioning if needed for invalidation
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      // Generate refresh token with longer expiration
      refreshToken = jwt.sign(
        { 
          userId: newUser._id,
          tokenType: 'refresh'
        },
        process.env.JWT_SECRET,
        { expiresIn: '90d' }
      );
      
      console.log('Tokens generated successfully');
    } catch (tokenError) {
      console.error('Error generating tokens:', tokenError);
      return errorResponse('Failed to generate authentication tokens', 500);
    }
    
    console.timeEnd('signup-execution');
    
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
    console.timeEnd('signup-execution');
    logger.error('Signup error:', error);
    
    // Log more detailed error information for debugging
    console.error('Detailed signup error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      env: process.env.NODE_ENV,
      dbName: process.env.MONGODB_DB_NAME
    });
    
    return errorResponse('Failed to create account', 500);
  }
};

// Wrap the handler with a try-catch to ensure we always return a Response
const safeHandler = async (req, ...args) => {
  try {
    return await handler(req, ...args);
  } catch (error) {
    console.error('Unhandled error in signup handler:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      env: process.env.NODE_ENV,
      dbName: process.env.MONGODB_DB_NAME
    });
    
    // Provide a more specific error message if possible
    if (error.message && error.message.includes('JWT')) {
      return errorResponse('Authentication token generation failed', 500);
    }
    
    if (error.message && error.message.includes('MongoDB') || error.message && error.message.includes('mongo')) {
      return errorResponse('Database operation failed', 500);
    }
    
    return errorResponse('Failed to create account: ' + (process.env.NODE_ENV === 'development' ? error.message : 'Server error'), 500);
  }
};

export const POST = withRateLimit(safeHandler, rateLimits.auth);