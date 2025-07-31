"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProfileContent from "../../components/ProfileContent";
import logger from "../../lib/logger";
import { apiFetch } from "../../lib/apiUtils";

export default function ProfilePage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/profile");
      return;
    }

    async function fetchUserProfile() {
      try {
        setLoadingProfile(true);
        const token = user?.token;
        if (!token) return;

        const data = await apiFetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserProfile(data);
      } catch (err) {
        logger.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again later.");
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
      <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
        <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
        <div className="max-w-4xl mx-auto p-6 pt-20 text-center relative">
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-red-200/20 dark:border-red-500/20 p-6 rounded-xl shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400/80 to-pink-500/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-red-200 dark:text-red-300 text-lg mb-6">
              {error || "Failed to load profile. Please try again later."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
      <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
      
      <div className="animate-fade-in max-w-6xl mx-auto p-6 relative">
        {/* Header Section */}
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 sm:p-8 rounded-xl shadow-xl mb-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/80 to-pink-600/80 dark:from-purple-400/60 dark:to-pink-500/60 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 dark:from-gray-100 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                    Your Profile
                  </h1>
                  <p className="text-indigo-100 dark:text-gray-300 text-sm">
                    Share your wishlist with friends and family
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="group bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center gap-2 shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>Edit Dashboard</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              
              <div className="bg-white/10 dark:bg-gray-700/30 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2 text-indigo-100 dark:text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium">Public Profile</span>
                </div>
              </div>
            </div>
          </div>
          
         
        </div>

        {/* Profile Content */}
        <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-600/20 rounded-xl shadow-xl overflow-hidden">
          <ProfileContent initialUser={userProfile} />
        </div>
      </div>
    </div>
  );
}
