import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  await connectDB();
  const { email, password, username } = await req.json();

  if (!email || !password || !username) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let slug = username.toLowerCase().replace(/[^a-z0-9]/g, '-');
  let uniqueSlug = slug;
  let counter = 1;
  while (await User.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const user = new User({ email, password: hashedPassword, username, slug: uniqueSlug });
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return new Response(JSON.stringify({ token }), { status: 201 });
}