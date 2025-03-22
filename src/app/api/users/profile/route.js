import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import { getSession } from '../../../../lib/auth';

export async function GET(req) {
  await connectDB();
  const session = await getSession(req);
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const user = await User.findById(session.userId).select('-password -__v');
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({
      _id: user._id,
      email: user.email,
      username: user.username,
      slug: user.slug,
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 