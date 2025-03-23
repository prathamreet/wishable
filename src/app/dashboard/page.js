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

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/dashboard');
      return;
    }
    
    if (user) {
      setLoading(false);
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

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