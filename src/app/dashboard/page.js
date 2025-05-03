'use client';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Wishlist from '../../components/Wishlist';
import SupportedSites from '../../components/SupportedSites';
import GamingFeatures from '../../components/GamingFeatures';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';
import logger from '../../lib/logger';
import { auth } from '../../lib/apiClient';

export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth state to be determined
    if (authLoading) return;
    
    // If not authenticated after auth loading completes, redirect to login
    if (!user) {
      router.replace('/login?redirect=/dashboard');
      return;
    }

    // User is authenticated, verify token validity
    const verifyToken = async () => {
      try {
        if (!user?.token) {
          throw new Error('Authentication token is missing');
        }
        
        // Make a test request to verify the token using our simplified auth.verify function
        await auth.verify();
        
        // Successfully verified
        setError(null);
        setLoading(false);
      } catch (err) {
        logger.error('Dashboard access error:', err);
        
        // Handle specific error cases
        if (err.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.message || 'Error accessing dashboard. Please try again.');
        }
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [user, authLoading, router]);

  // Show loading spinner while auth is loading
  if (loading || authLoading) {
    return <LoadingSpinner />;
  }
  
  // Show error message if there's an authentication error
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-8 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
        <button 
          onClick={() => router.push('/login?redirect=/dashboard')}
          className="btn-primary mt-4"
        >
          Log In Again
        </button>
      </div>
    );
  }

  // Show dashboard content if authenticated
  return (
    <div className="animate-fade-in max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <Link href="/profile" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          View Profile
        </Link>
      </div>
      
      <Wishlist />
      
      {/* Display supported sites */}
      <SupportedSites />
      
      {/* New feature announcement */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold mb-2">New: Enhanced Gaming Support!</h2>
        <p className="mb-3">
          We&apos;ve added support for all major gaming platforms. Now you can track games from Steam, Epic Games, GOG, 
          PlayStation Store, Xbox Store, Nintendo eShop, and many more!
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">Steam</span>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">Epic Games</span>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">GOG</span>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">PlayStation</span>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">Xbox</span>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">Nintendo</span>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">+ More</span>
        </div>
      </div>
      
      {/* Gaming features component */}
      <GamingFeatures />
    </div>
  );
}

// export const metadata = {
//   title: 'Dashboard - WishAble',
//   description: 'Manage your wishlist on WishAble.',
// };