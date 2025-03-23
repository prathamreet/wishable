import connectDB from '../../../../lib/db';
import { getSession } from '../../../../lib/auth';
import User from '../../../../models/User';
import { NextResponse } from 'next/server';
import logger from '../../../../lib/logger';

export async function DELETE(request) {
  try {
    // Verify the user's token
    const session = getSession(request);
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(session.userId);
    
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    logger.info(`User account deleted: ${session.userId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    logger.error('Error deleting user account:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 