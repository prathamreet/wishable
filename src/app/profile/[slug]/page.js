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
        title: 'User Not Found - Wishable',
        description: 'The requested user profile could not be found.'
      };
    }
    
    return {
      title: `${user.username}'s Wishlist - Wishable`,
      description: `Check out ${user.username}'s wishlist on Wishable.`,
    };
  } catch (error) {
    logger.error('Metadata generation error:', error);
    return {
      title: 'Error - Wishable',
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

    const serializedUser = JSON.parse(JSON.stringify(user));

    return (
      <div className="min-h-screen bg-white">
        <Suspense fallback={<LoadingSpinner fullScreen={true} />}>
          <div className="animate-fade-in">
            <ProfileContent initialUser={serializedUser} />
          </div>
        </Suspense>
      </div>
    );
  } catch (error) {
    if (error.message && error.message.includes('NEXT_HTTP_ERROR_FALLBACK;404')) {
      return notFound();
    }
    
    logger.error('Profile page error:', error);
    
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6 pt-20 text-center">
          <div className="border border-red-600 bg-red-50 p-12">
            <h1 className="text-2xl font-semibold tracking-tight mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-red-900 text-lg mb-6">
              An error occurred while loading this profile. Please try again later.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Try Again
              </button>
              
              <Link
                href="/"
                className="btn-primary inline-block"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
