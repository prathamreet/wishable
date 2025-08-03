"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "../../../components/LoadingSpinner";
import logger from "../../../lib/logger";
import { apiFetch } from "../../../lib/apiUtils";

export default function ProfileDashboard() {
  const {
    user,
    refreshUserProfile,
    loading: authLoading,
    deleteAccount,
  } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    // Wait for auth state to be determined
    if (authLoading) {
      return;
    }

    // If not authenticated, redirect to login
    if (!user || !user.token) {
      router.replace("/login?redirect=/dashboard/profile");
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        const token = user.token;

        // Make API request with proper cache control
        const data = await apiFetch("/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
        });

        setProfile(data);
        setError(null);
      } catch (err) {
        logger.error("Error fetching profile:", err);
        if (err.status === 401) {
          // Handle token expiration - completely clear auth state
          setError("Your session has expired. Please log in again.");
          router.replace("/login?redirect=/dashboard/profile");
          return;
        }
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (user.token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setProfile((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccess(false);
      setError(null);

      const token = user?.token;
      if (!token) throw new Error("Not authenticated");

      // Check if email changed
      if (profile.email !== user.email) {
        // Simple email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email)) {
          setError("Please enter a valid email address");
          setSaving(false);
          return;
        }
      }

      // Check if username changed and confirm before proceeding
      if (profile.username !== user.username) {
        const confirmChange = window.confirm(
          "Changing your username will also change your profile URL. Continue?"
        );
        if (!confirmChange) {
          setSaving(false);
          return;
        }
      }

      const data = await apiFetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
        body: JSON.stringify(profile),
      });

      // Refresh the user context with updated data
      await refreshUserProfile();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Don't log expected errors like username or email conflicts
      const isExpectedError =
        err.message.includes("Username is already taken") ||
        err.message.includes("URL that conflicts") ||
        err.message.includes("Email is already registered") ||
        err.message.includes("Invalid email format");

      if (!isExpectedError) {
        logger.error("Error updating profile:", err);
      }

      // Provide more specific error message
      if (err.message.includes("Username is already taken")) {
        setError(
          "This username is already in use. Please choose a different one."
        );
      } else if (err.message.includes("URL that conflicts")) {
        setError(
          "This username would create a URL that conflicts with another user. Please choose a different one."
        );
      } else if (err.message.includes("Email is already registered")) {
        setError(
          "This email address is already registered to another account. Please use a different email."
        );
      } else if (err.message.includes("Invalid email format")) {
        setError("Please enter a valid email address.");
      } else {
        setError(
          err.message || "Failed to update profile. Please try again later."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
        <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
        <div className="max-w-4xl mx-auto p-6 pt-20 text-center relative">
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-red-200/20 dark:border-red-500/20 p-6 rounded-xl shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400/80 to-pink-500/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-red-200 dark:text-red-300 text-lg">
              {error || "Failed to load profile. Please try again later."}
            </p>
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500/80 to-pink-600/80 dark:from-purple-400/60 dark:to-pink-500/60 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 dark:from-gray-100 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-indigo-100 dark:text-gray-300 text-sm">
                Manage your account and personal information
              </p>
            </div>
          </div>
          
          {/* Last Updated Info */}
          <div className="pt-4 border-t border-white/20 dark:border-gray-600/30">
            <div className="flex items-center gap-2 text-indigo-100 dark:text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm">
                Last updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Messages */}
        {error && (
          <div className="bg-red-400/20 dark:bg-red-500/20 border border-red-400/30 dark:border-red-500/30 text-red-200 dark:text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm mb-6">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-400/20 dark:bg-green-500/20 border border-green-400/30 dark:border-green-500/30 text-green-200 dark:text-green-300 px-6 py-4 rounded-xl backdrop-blur-sm mb-6">
            <div className="flex items-center gap-2">
              <span>✅</span>
              Profile updated successfully!
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 rounded-xl shadow-xl mb-8 overflow-hidden">
          <nav className="flex">
            {[
              { id: 'personal', label: 'Personal Information', icon: '👤' },
              { id: 'address', label: 'Address', icon: '🏠' },
              { id: 'security', label: 'Security', icon: '🔒' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all duration-300 border-b-2 ${
                  activeTab === tab.id
                    ? "border-white text-white dark:text-gray-100 bg-white/10 dark:bg-gray-700/50"
                    : "border-transparent text-indigo-200 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 hover:bg-white/5 dark:hover:bg-gray-700/30"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 sm:p-8 rounded-xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400/80 to-indigo-500/80 dark:from-blue-400/60 dark:to-indigo-500/60 rounded-full flex items-center justify-center">
                    <span className="text-lg">ℹ️</span>
                  </div>
                  <h2 className="text-xl font-bold text-white dark:text-gray-200">Basic Information</h2>
                </div>

                {/* Profile Picture */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white dark:text-gray-200 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500/80 to-purple-600/80 dark:from-indigo-400/60 dark:to-purple-500/60 shadow-xl border-4 border-white/20 dark:border-gray-600/30">
                      {profile.profilePicture ? (
                        <Image
                          src={profile.profilePicture}
                          alt="Profile picture"
                          fill
                          className="object-cover"
                          priority={true}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
                          {profile.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-sm text-indigo-100 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/20 file:text-white hover:file:bg-white/30 file:transition-all file:duration-300"
                      />
                      <p className="text-xs text-indigo-200 dark:text-gray-400">
                        Recommended: Square image, max 1MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profile.username || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                      required
                    />
                    <p className="text-xs text-indigo-200 dark:text-gray-400 mt-1">
                      This will change your profile URL
                    </p>
                  </div>

                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={profile.displayName || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                    />
                    <p className="text-xs text-indigo-200 dark:text-gray-400 mt-1">
                      Shown on your profile to others
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 sm:p-8 rounded-xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400/80 to-blue-500/80 dark:from-green-400/60 dark:to-blue-500/60 rounded-full flex items-center justify-center">
                    <span className="text-lg">📞</span>
                  </div>
                  <h2 className="text-xl font-bold text-white dark:text-gray-200">Contact Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactDetails.phone" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="contactDetails.phone"
                      name="contactDetails.phone"
                      value={profile.contactDetails?.phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactDetails.alternateEmail" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                      Alternate Email
                    </label>
                    <input
                      type="email"
                      id="contactDetails.alternateEmail"
                      name="contactDetails.alternateEmail"
                      value={profile.contactDetails?.alternateEmail || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === "address" && (
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 sm:p-8 rounded-xl shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400/80 to-orange-500/80 dark:from-yellow-400/60 dark:to-orange-500/60 rounded-full flex items-center justify-center">
                  <span className="text-lg">🏠</span>
                </div>
                <h2 className="text-xl font-bold text-white dark:text-gray-200">Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address.street" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={profile.address?.street || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={profile.address?.city || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={profile.address?.state || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="address.postalCode" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="address.postalCode"
                    name="address.postalCode"
                    value={profile.address?.postalCode || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="address.country" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="address.country"
                    name="address.country"
                    value={profile.address?.country || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              {/* Account Security */}
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 sm:p-8 rounded-xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400/80 to-blue-500/80 dark:from-purple-400/60 dark:to-blue-500/60 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔒</span>
                  </div>
                  <h2 className="text-xl font-bold text-white dark:text-gray-200">Account Security</h2>
                </div>

                <div className="bg-blue-400/20 dark:bg-blue-500/20 border border-blue-400/30 dark:border-blue-500/30 text-blue-200 dark:text-blue-300 px-4 py-3 rounded-lg backdrop-blur-sm mb-6">
                  <p className="text-sm">
                    Password changes and advanced security settings will be implemented in a future update.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                      Account Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={profile.role || "user"}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-indigo-200 dark:text-gray-400 mt-1">
                      Your account permissions level
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                      Account Status
                    </label>
                    <div className="bg-green-400/20 dark:bg-green-500/20 border border-green-400/30 dark:border-green-500/30 text-green-200 dark:text-green-300 px-4 py-3 rounded-lg backdrop-blur-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Active</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white dark:text-gray-200 mb-2">
                      Account Created
                    </label>
                    <div className="bg-white/10 dark:bg-gray-700/30 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 px-4 py-3 rounded-lg text-indigo-100 dark:text-gray-300">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Account Section */}
              <div className="bg-red-400/10 dark:bg-red-500/10 backdrop-blur-md border border-red-400/30 dark:border-red-500/30 p-6 sm:p-8 rounded-xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500/80 to-pink-600/80 dark:from-red-400/60 dark:to-pink-500/60 rounded-full flex items-center justify-center">
                    <span className="text-lg">🗑️</span>
                  </div>
                  <h2 className="text-xl font-bold text-red-200 dark:text-red-300">Delete Account</h2>
                </div>

                <div className="bg-red-500/20 dark:bg-red-600/20 border border-red-400/30 dark:border-red-500/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-red-300 dark:text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-200 dark:text-red-300 mb-2">
                        Warning: This action cannot be undone
                      </h3>
                      <p className="text-sm text-red-300 dark:text-red-400">
                        Deleting your account will permanently remove all your data, including your profile information and wishlist. This action cannot be reversed.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <span>🗑️</span>
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="group bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-8 py-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center gap-2 min-w-40"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Changes</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 backdrop-blur-md" onClick={() => setShowDeleteConfirmation(false)} aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block px-6 pt-6 pb-6 overflow-hidden text-left align-bottom transition-all transform bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 rounded-xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div>
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-500/20 dark:bg-red-600/20 rounded-full border border-red-400/30 dark:border-red-500/30">
                  <svg className="w-8 h-8 text-red-300 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-white dark:text-gray-200 mb-3">
                    Are you sure you want to delete your account?
                  </h3>
                  <p className="text-sm text-indigo-100 dark:text-gray-400">
                    This action cannot be undone. All of your data will be permanently deleted from our servers.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="mt-4 bg-red-400/20 dark:bg-red-500/20 border border-red-400/30 dark:border-red-500/30 text-red-200 dark:text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    {deleteError}
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    setDeleteError("");
                    try {
                      const result = await deleteAccount();
                      if (!result.success) {
                        setDeleteError(result.error || "Failed to delete account. Please try again.");
                        setIsDeleting(false);
                      }
                    } catch (error) {
                      setDeleteError("An unexpected error occurred. Please try again.");
                      setIsDeleting(false);
                    }
                  }}
                  className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Delete Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
