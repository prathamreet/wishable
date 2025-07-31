import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import ProfileContent from '../../../components/ProfileContent';
import LoadingSpinner from '../../../components/LoadingSpinner';
import logger from '../../../lib/logger';
import Link from 'next/link';

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
    const user = await User.findOne({ slug }, 'username wishlist profilePicture displayName address contactDetails createdAt updatedAt');
    
    if (!user) {
      return notFound();
    }

    // Serialize the MongoDB document to plain JSON to prevent issues with circular references
    const serializedUser = JSON.parse(JSON.stringify(user));

    return (
      <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
        <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
        
        <div className="relative">
          <Suspense fallback={<LoadingSpinner fullScreen={true} />}>
            <div className="animate-fade-in">
              <ProfileContent initialUser={serializedUser} />
            </div>
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    // Don't log 404 errors as they're expected when a profile doesn't exist
    if (error.message && error.message.includes('NEXT_HTTP_ERROR_FALLBACK;404')) {
      return notFound();
    }
    
    // Only log other unexpected errors
    logger.error('Profile page error:', error);
    
    return (
      <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
        <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
        
        <div className="max-w-4xl mx-auto p-6 pt-20 text-center relative">
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-red-200/20 dark:border-red-500/20 p-8 rounded-xl shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-r from-red-400/80 to-pink-500/80 dark:from-red-400/60 dark:to-pink-500/60 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-200 to-red-100 dark:from-red-300 dark:to-red-200 bg-clip-text text-transparent mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-red-200 dark:text-red-300 text-lg mb-6">
              An error occurred while loading this profile. Please try again later.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                Try Again
              </button>
              
              <Link
                href="/"
                className="bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <span>🏠</span>
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
