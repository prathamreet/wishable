import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import logger from '../../../../lib/logger';

// Helper function to verify token and get user ID
async function verifyTokenAndGetUserId(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// GET - Fetch user profile
export async function GET(req) {
  try {
    const userId = await verifyTokenAndGetUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const user = await User.findById(userId, '-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(req) {
  try {
    const userId = await verifyTokenAndGetUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Remove fields that shouldn't be updated directly
    delete data.password;
    delete data._id;
    delete data.createdAt;
    delete data.wishlist;
    
    await connectDB();
    
    // First get current user to compare with update data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check for conflicts on email update
    if (data.email && data.email !== currentUser.email) {
      // Validate email format (simple check)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }
      
      // Check if email is already taken
      const existingEmail = await User.findOne({
        _id: { $ne: userId },
        email: data.email
      });
      
      if (existingEmail) {
        return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
      }
    }
    
    // Only check for conflicts if username is actually changing
    if (data.username && data.username !== currentUser.username) {
      // Validate username
      if (data.username.length < 3 || data.username.length > 50) {
        return NextResponse.json({ error: 'Username must be between 3 and 50 characters' }, { status: 400 });
      }
      
      // Generate slug from username
      const newSlug = data.username.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      data.slug = newSlug;
      
      // Check if username or slug is already taken (case insensitive)
      const existing = await User.findOne({
        _id: { $ne: userId },
        $or: [
          { username: { $regex: new RegExp(`^${data.username}$`, 'i') } },
          { slug: newSlug }
        ]
      });
      
      if (existing) {
        return NextResponse.json({ 
          error: existing.username.toLowerCase() === data.username.toLowerCase() 
            ? 'Username is already taken' 
            : 'This username would create a URL that conflicts with another user'
        }, { status: 400 });
      }
    }
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true, select: '-password' }
    );
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 