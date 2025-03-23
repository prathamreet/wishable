'use client';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProfileContent from '../../components/ProfileContent';

export default function ProfilePage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/profile');
      return;
    }

    async function fetchUserProfile() {
      try {
        setLoadingProfile(true);
        const token = user?.token;
        if (!token) return;

        const response = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoadingProfile(false);
      }
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, loading, router]);

  if (loading || loadingProfile) {
    return <LoadingSpinner />;
  }

  if (error || !userProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded">
          {error || 'Failed to load profile. Please try again later.'}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-indigo-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-indigo-200">View and manage your personal information</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto mt-6 px-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            To edit your profile, visit your <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">dashboard</Link>.
          </p>
        </div>
        
        <ProfileContent initialUser={userProfile} />
      </div>
    </div>
  );
} 