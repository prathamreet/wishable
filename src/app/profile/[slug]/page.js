import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import ProfileContent from '../../../components/ProfileContent';
import LoadingSpinner from '../../../components/LoadingSpinner';
import logger from '../../../lib/logger';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    await connectDB();
    const user = await User.findOne({ slug }, 'username');
    
    if (!user) {
      return { 
        title: 'User Not Found - WishAble',
        description: 'The requested user profile could not be found.'
      };
    }
    
    return {
      title: `${user.username}'s Wishlist - WishAble`,
      description: `Check out ${user.username}'s wishlist on WishAble.`,
    };
  } catch (error) {
    logger.error('Metadata generation error:', error);
    return {
      title: 'Error - WishAble',
      description: 'An error occurred while loading this profile.'
    };
  }
}

export default async function ProfilePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    await connectDB();
    const user = await User.findOne({ slug }, 'username wishlist profilePicture displayName address contactDetails');
    
    if (!user) {
      return notFound();
    }

    // Serialize the MongoDB document to plain JSON to prevent issues with circular references
    const serializedUser = JSON.parse(JSON.stringify(user));

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ProfileContent initialUser={serializedUser} />
      </Suspense>
    );
  } catch (error) {
    // Don't log 404 errors as they're expected when a profile doesn't exist
    if (error.message && error.message.includes('NEXT_HTTP_ERROR_FALLBACK;404')) {
      return notFound();
    }
    
    // Only log other unexpected errors
    logger.error('Profile page error:', error);
    
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded">
          An error occurred while loading this profile. Please try again later.
        </div>
      </div>
    );
  }
}