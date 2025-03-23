import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { getSession } from '../../../lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.userId, 'wishlist');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user.wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    const { scrapeProductDetails } = await import('../../../lib/scraper');
    
    try {
      const details = await scrapeProductDetails(url);
      const user = await User.findById(session.userId);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      user.wishlist.push({ url, ...details });
      await user.save();
      
      return NextResponse.json({ message: 'Item added', item: { url, ...details } });
    } catch (error) {
      console.error('Error scraping product:', error);
      return NextResponse.json({ error: error.message || 'Failed to scrape product' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}