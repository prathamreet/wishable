"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Wishlist from "../../components/Wishlist";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import Link from "next/link";
import logger from "../../lib/logger";
import { auth } from "../../lib/apiClient";

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
      router.replace("/login?redirect=/dashboard");
      return;
    }

    // User is authenticated, verify token validity
    const verifyToken = async () => {
      try {
        if (!user?.token) {
          throw new Error("Authentication token is missing");
        }

        // Make a test request to verify the token using our simplified auth.verify function
        await auth.verify();

        // Successfully verified
        setError(null);
        setLoading(false);
      } catch (err) {
        logger.error("Dashboard access error:", err);

        // Handle specific error cases
        if (err.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError(
            err.message || "Error accessing dashboard. Please try again."
          );
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
      <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
        <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
        <div className="max-w-4xl mx-auto p-6 pt-20 text-center relative">
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-red-200/20 dark:border-red-500/20 p-6 rounded-xl shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400/80 to-pink-500/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-red-200 dark:text-red-300 text-lg mb-6">
              {error}
            </p>
            <button
              onClick={() => router.push("/login?redirect=/dashboard")}
              className="bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Log In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard content if authenticated
  return (
    <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
      <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
      
      <div className="animate-fade-in max-w-6xl mx-auto p-6 relative">
        {/* Header Section */}
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 sm:p-8 rounded-xl shadow-xl mb-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500/80 to-purple-600/80 dark:from-indigo-400/60 dark:to-purple-500/60 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 dark:from-gray-100 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                    Your Wishlist
                  </h1>
                  <p className="text-indigo-100 dark:text-gray-300 text-sm">
                    Manage and organize your perfect gifts
                  </p>
                </div>
              </div>
            </div>
            
            <Link
              href="/profile"
              className="group bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center gap-2 shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>View Profile</span>
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
          </div>
        </div>

        {/* Wishlist Content */}
        <div className="overflow-hidden">
          <Wishlist />
        </div>
      </div>
    </div>
  );
}
