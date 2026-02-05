"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../contexts/AuthContext";
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
    return <LoadingSpinner fullScreen={true} />;
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6 pt-20 text-center">
          <div className="border border-red-600 bg-red-50 p-12">
            <p className="text-red-900 text-lg mb-6">
              {error || "Failed to load profile. Please try again later."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="border border-neutral-200 p-8 mb-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">
                Your Profile
              </h1>
              <p className="text-neutral-600">
                Share your wishlist with friends and family
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="btn-secondary inline-flex items-center gap-2"
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
              </Link>
              
              <Link 
                href={`/profile/${userProfile.slug || userProfile.username}`}
                target="_blank"
                className="btn-outline inline-flex items-center gap-2"
              >
                <span>View Public Profile</span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="border border-neutral-200">
          <ProfileContent initialUser={userProfile} />
        </div>
      </div>
    </div>
  );
}
