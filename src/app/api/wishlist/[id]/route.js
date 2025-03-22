import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import { getSession } from '../../../../lib/auth';
import mongoose from 'mongoose';

export async function PUT(req, { params }) {
  await connectDB();
  const session = await getSession(req);
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { url } = await req.json();
  const { scrapeProductDetails } = await import('../../../../lib/scraper');
  try {
    const details = await scrapeProductDetails(url);
    const user = await User.findOneAndUpdate(
      { _id: session.userId, 'wishlist._id': params.id },
      { $set: { 'wishlist.$': { url, ...details } } },
      { new: true }
    );
    return new Response(JSON.stringify({ message: 'Item updated' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  
  await connectDB();
  const session = await getSession(req);
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const result = await User.updateOne(
      { _id: session.userId },
      { $pull: { wishlist: { _id: objectId } } }
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}