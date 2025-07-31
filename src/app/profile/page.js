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
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded">
          {error || "Failed to load profile. Please try again later."}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mt-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-row justify-between items-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            To edit your profile, visit your{" "}
            <Link
              href="/dashboard"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              dashboard.
            </Link>
          </p>
          
        </div>
      </div>

      <ProfileContent initialUser={userProfile} />
      
    </div>
  );
}
