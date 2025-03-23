import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../../../../lib/logger';
import { errorResponse, successResponse } from '../../../../lib/apiUtils';

export const dynamic = 'force-dynamic'; // Never cache this route

export async function POST(req) {
  console.time('login-execution');
  try {
    // Connect to the database first
    await connectDB();
    console.timeLog('login-execution', 'DB connected');
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return errorResponse('Invalid request body', 400);
    }
    
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    console.timeLog('login-execution', 'Validation complete');

    // Find user by email - only select fields we need
    const user = await User.findOne({ email }).select('_id password username slug');
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.timeEnd('login-execution');
    return successResponse({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        slug: user.slug
      } 
    });
  } catch (error) {
    console.timeEnd('login-execution');
    logger.error('Login error:', error);
    return errorResponse('Authentication failed', 500);
  }
}