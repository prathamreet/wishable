import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import { getSession } from '../../../../lib/auth';
import mongoose from 'mongoose';

export async function PUT(req, { params }) {
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
    
    const { scrapeProductDetails } = await import('../../../../lib/scraper');
    try {
      const details = await scrapeProductDetails(url);
      const user = await User.findOneAndUpdate(
        { _id: session.userId, 'wishlist._id': params.id },
        { $set: { 'wishlist.$': { url, ...details } } },
        { new: true }
      );
      
      if (!user) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Item updated' });
    } catch (error) {
      console.error('Error updating wishlist item:', error);
      return NextResponse.json({ error: error.message || 'Failed to update item' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in PUT wishlist/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    await connectDB();
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const result = await User.updateOne(
        { _id: session.userId },
        { $pull: { wishlist: { _id: objectId } } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        return NextResponse.json({ error: 'Invalid item ID format' }, { status: 400 });
      }
      
      console.error('Error deleting wishlist item:', error);
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in DELETE wishlist/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}