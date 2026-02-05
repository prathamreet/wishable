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
    if (authLoading) return;

    if (!user) {
      router.replace("/login?redirect=/dashboard");
      return;
    }

    const verifyToken = async () => {
      try {
        if (!user?.token) {
          throw new Error("Authentication token is missing");
        }

        await auth.verify();
        setError(null);
        setLoading(false);
      } catch (err) {
        logger.error("Dashboard access error:", err);

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

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="border border-red-600 bg-red-50 p-8">
            <p className="text-red-900 text-lg mb-6">
              {error}
            </p>
            <button
              onClick={() => router.push("/login?redirect=/dashboard")}
              className="btn-primary"
            >
              Log In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="border-b border-neutral-200 pb-8 mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight mb-2">
                Your Wishlist
              </h1>
              <p className="text-neutral-600">
                Manage and organize your items
              </p>
            </div>
            
            <Link
              href="/profile"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
            </Link>
          </div>
        </div>

        <div>
          <Wishlist />
        </div>
      </div>
    </div>
  );
}
