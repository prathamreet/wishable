'use client';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../contexts/AuthContext';
import Wishlist from '../../components/Wishlist';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      <Wishlist />
    </div>
  );
}

// export const metadata = {
//   title: 'Dashboard - WishAble',
//   description: 'Manage your wishlist on WishAble.',
// };