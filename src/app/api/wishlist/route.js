import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { getSession } from '../../../lib/auth';

export async function GET(req) {
  await connectDB();
  const session = await getSession(req);
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const user = await User.findById(session.userId, 'wishlist');
  return new Response(JSON.stringify(user.wishlist), { status: 200 });
}

export async function POST(req) {
  await connectDB();
  const session = await getSession(req);
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { url } = await req.json();
  const { scrapeProductDetails } = await import('../../../lib/scraper');
  try {
    const details = await scrapeProductDetails(url);
    const user = await User.findById(session.userId);
    user.wishlist.push({ url, ...details });
    await user.save();
    return new Response(JSON.stringify({ message: 'Item added', item: { url, ...details } }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}