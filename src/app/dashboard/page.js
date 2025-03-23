'use client';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Wishlist from '../../components/Wishlist';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

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
        
        // Make a test request to verify the token
        const response = await fetch('/api/auth/verify', {
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Cache-Control': 'no-store'
          }
        });
        
        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
          } else {
            const data = await response.json();
            throw new Error(data.error || 'Failed to verify access');
          }
        }
        
        // Successfully verified access
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard access error:', err);
        setError(err.message || 'Error accessing dashboard. Please try again.');
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
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      <Wishlist />
    </div>
  );
}

// export const metadata = {
//   title: 'Dashboard - WishAble',
//   description: 'Manage your wishlist on WishAble.',
// };