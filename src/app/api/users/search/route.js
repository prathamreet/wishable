import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import logger from '../../../../lib/logger';

export const dynamic = 'force-dynamic'; // Do not cache this route

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    await connectDB();
    
    // First try exact match
    let user = await User.findOne(
      { username: username },
      'username slug'
    ).lean();
    
    // If not found, try case-insensitive match
    if (!user) {
      try {
        user = await User.findOne(
          { username: { $regex: new RegExp(`^${username}$`, 'i') } },
          'username slug'
        ).lean();
      } catch (regexError) {
        // Handle potential regex errors
        logger.error('Regex search error:', regexError);
      }
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { 
        status: 404,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        slug: user.slug
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, s-maxage=60, stale-while-revalidate=30'  // Short cache for found users
      }
    });
  } catch (error) {
    logger.error('User search error:', error);
    return NextResponse.json({ error: 'Server error' }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
} 