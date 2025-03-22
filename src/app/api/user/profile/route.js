import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';

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
    console.error('Error fetching user profile:', error);
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
    
    // Validate username if changed
    if (data.username) {
      if (data.username.length < 3 || data.username.length > 50) {
        return NextResponse.json({ error: 'Username must be between 3 and 50 characters' }, { status: 400 });
      }
      
      // Generate slug from username if username is changed
      data.slug = data.username.toLowerCase().replace(/\s+/g, '-');
    }
    
    await connectDB();
    
    // Check if username or slug is already taken
    if (data.username || data.slug) {
      const existing = await User.findOne({
        _id: { $ne: userId },
        $or: [
          { username: data.username },
          { slug: data.slug }
        ]
      });
      
      if (existing) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
      }
    }
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true, select: '-password' }
    );
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 