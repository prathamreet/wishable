import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../../../../lib/logger';

export async function POST(req) {
  try {
    await connectDB();
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return new Response(JSON.stringify({ error: 'User already exists with this email' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return new Response(JSON.stringify({ error: 'Username already taken' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    return new Response(JSON.stringify({ token }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create account' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}