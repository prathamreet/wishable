'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Wishlist from '../../components/Wishlist';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    // Verify token validity with the API
    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          // Clear invalid token
          localStorage.removeItem('token');
          router.replace('/login');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth verification error:', error);
        setLoading(false);
      }
    };

    verifyToken();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      <Wishlist />
    </div>
  );
}

// export const metadata = {
//   title: 'Dashboard - WishAble',
//   description: 'Manage your wishlist on WishAble.',
// };