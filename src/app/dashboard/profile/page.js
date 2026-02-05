"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../contexts/AuthContext";
import Image from "next/image";
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
    if (authLoading) {
      return;
    }

    if (!user || !user.token) {
      router.replace("/login?redirect=/dashboard/profile");
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        const token = user.token;

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

      if (profile.email !== user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email)) {
          setError("Please enter a valid email address");
          setSaving(false);
          return;
        }
      }

      if (profile.username !== user.username) {
        const confirmChange = window.confirm(
          "Changing your username will also change your profile URL. Continue?"
        );
        if (!confirmChange) {
          setSaving(false);
          return;
        }
      }

      await apiFetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
        body: JSON.stringify(profile),
      });

      await refreshUserProfile();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const isExpectedError =
        err.message.includes("Username is already taken") ||
        err.message.includes("URL that conflicts") ||
        err.message.includes("Email is already registered") ||
        err.message.includes("Invalid email format");

      if (!isExpectedError) {
        logger.error("Error updating profile:", err);
      }

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
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6 pt-20 text-center">
          <div className="border border-red-600 bg-red-50 p-12">
            <p className="text-red-900 text-lg mb-4">
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
          <div className="mb-4">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              Profile Settings
            </h1>
            <p className="text-neutral-600">
              Manage your account and personal information
            </p>
          </div>
          
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              Last updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "N/A"}
            </p>
          </div>
        </div>

        {/* Notification Messages */}
        {error && (
          <div className="border border-red-600 bg-red-50 text-red-900 px-6 py-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="border border-green-600 bg-green-50 text-green-900 px-6 py-4 mb-6 text-sm">
            Profile updated successfully!
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border border-neutral-200 mb-8">
          <nav className="flex">
            {[
              { id: 'personal', label: 'Personal Information' },
              { id: 'address', label: 'Address' },
              { id: 'security', label: 'Security' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-transparent hover:bg-neutral-50"
                }`}
              >
                {tab.label}
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
              <div className="border border-neutral-200 p-8">
                <h2 className="text-xl font-semibold tracking-tight mb-6">Basic Information</h2>

                {/* Profile Picture */}
                <div className="mb-6">
                  <label className="form-label">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 overflow-hidden bg-neutral-950 border border-neutral-900">
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
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:border file:border-neutral-900 file:text-sm file:font-medium file:bg-white hover:file:bg-neutral-50"
                      />
                      <p className="text-xs text-neutral-600">
                        Recommended: Square image, max 1MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profile.username || ""}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                    <p className="text-xs text-neutral-600 mt-1">
                      This will change your profile URL
                    </p>
                  </div>

                  <div>
                    <label htmlFor="displayName" className="form-label">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={profile.displayName || ""}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    <p className="text-xs text-neutral-600 mt-1">
                      Shown on your profile to others
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email || ""}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="border border-neutral-200 p-8">
                <h2 className="text-xl font-semibold tracking-tight mb-6">Contact Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactDetails.phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="contactDetails.phone"
                      name="contactDetails.phone"
                      value={profile.contactDetails?.phone || ""}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactDetails.alternateEmail" className="form-label">
                      Alternate Email
                    </label>
                    <input
                      type="email"
                      id="contactDetails.alternateEmail"
                      name="contactDetails.alternateEmail"
                      value={profile.contactDetails?.alternateEmail || ""}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === "address" && (
            <div className="border border-neutral-200 p-8">
              <h2 className="text-xl font-semibold tracking-tight mb-6">Delivery Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address.street" className="form-label">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={profile.address?.street || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="address.city" className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={profile.address?.city || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="address.state" className="form-label">
                    State
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={profile.address?.state || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="address.postalCode" className="form-label">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="address.postalCode"
                    name="address.postalCode"
                    value={profile.address?.postalCode || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="address.country" className="form-label">
                    Country
                  </label>
                  <input
                    type="text"
                    id="address.country"
                    name="address.country"
                    value={profile.address?.country || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              {/* Account Security */}
              <div className="border border-neutral-200 p-8">
                <h2 className="text-xl font-semibold tracking-tight mb-6">Account Security</h2>

                <div className="border border-blue-600 bg-blue-50 text-blue-900 px-4 py-3 mb-6 text-sm">
                  Password changes and advanced security settings will be implemented in a future update.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="role" className="form-label">
                      Account Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={profile.role || "user"}
                      className="form-input opacity-50 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-neutral-600 mt-1">
                      Your account permissions level
                    </p>
                  </div>

                  <div>
                    <label className="form-label">
                      Account Status
                    </label>
                    <div className="border border-green-600 bg-green-50 text-green-900 px-4 py-3 flex items-center gap-2 text-sm font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Active</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">
                      Account Created
                    </label>
                    <div className="border border-neutral-200 px-4 py-3 text-neutral-600 text-sm">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Account Section */}
              <div className="border-2 border-red-600 bg-red-50 p-8">
                <h2 className="text-xl font-semibold text-red-900 mb-6">Delete Account</h2>

                <div className="bg-red-100 border border-red-600 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-red-900 mb-2">
                        Warning: This action cannot be undone
                      </h3>
                      <p className="text-sm text-red-900">
                        Deleting your account will permanently remove all your data, including your profile information and wishlist. This action cannot be reversed.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium transition-colors"
                >
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
              className="btn-primary disabled:opacity-50 min-w-40"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white border border-neutral-900 max-w-lg w-full p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-50 border border-red-600 mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold tracking-tight mb-3">
                  Are you sure you want to delete your account?
                </h3>
                <p className="text-sm text-neutral-600">
                  This action cannot be undone. All of your data will be permanently deleted from our servers.
                </p>
              </div>

              {deleteError && (
                <div className="border border-red-600 bg-red-50 text-red-900 px-4 py-3 mb-4 text-sm">
                  {deleteError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="btn-secondary"
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
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
