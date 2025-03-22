import connectDB from '../../../../lib/db';
import User from '../../../../models/User';

export async function GET(req, { params }) {
  await connectDB();
  const user = await User.findOne({ slug: params.slug }, 'username wishlist');
  if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  return new Response(JSON.stringify(user), { status: 200 });
}