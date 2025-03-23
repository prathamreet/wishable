'use client';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../../contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function ProfileDashboard() {
  const { user, refreshUserProfile, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    // Wait for auth state to be determined
    if (authLoading) {
      return;
    }
    
    // If not authenticated, redirect to login
    if (!user || !user.token) {
      router.replace('/login?redirect=/dashboard/profile');
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        const token = user.token;
        
        // Make API request with proper cache control
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Handle token expiration - completely clear auth state
            setError('Your session has expired. Please log in again.');
            router.replace('/login?redirect=/dashboard/profile');
            return;
          }
          
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }

        const data = await response.json();
        console.log("Profile data loaded:", data);
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again later.');
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
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          profilePicture: reader.result
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
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Refresh the user context
      await refreshUserProfile();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
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
          <h1 className="text-3xl font-bold mb-2">Profile Management</h1>
          <p className="text-indigo-200">Update your profile information and preferences</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-2 rounded mb-4">
            Profile updated successfully!
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            <a href="/profile" className="btn-secondary">
              View Public Profile
            </a>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Last updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'address'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Address
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Security
            </button>
          </nav>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-section animate-fade-in">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 accent-border pl-3">Basic Information</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {profile.profilePicture ? (
                        <Image 
                          src={profile.profilePicture} 
                          alt="Profile picture" 
                          fill 
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-indigo-100 dark:bg-indigo-900/20 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {profile.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-sm text-gray-600 dark:text-gray-300 mb-1"
                      />
                      <p className="text-xs text-gray-500">Recommended: Square image, max 1MB</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profile.username || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">This will change your profile URL</p>
                  </div>
                  
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium mb-1">Display Name</label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={profile.displayName || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Shown on your profile to others</p>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4 accent-border pl-3">Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactDetails.phone" className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="contactDetails.phone"
                      name="contactDetails.phone"
                      value={profile.contactDetails?.phone || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contactDetails.alternateEmail" className="block text-sm font-medium mb-1">Alternate Email</label>
                    <input
                      type="email"
                      id="contactDetails.alternateEmail"
                      name="contactDetails.alternateEmail"
                      value={profile.contactDetails?.alternateEmail || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 accent-border pl-3">Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="address.street" className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={profile.address?.street || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={profile.address?.city || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={profile.address?.state || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.postalCode" className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    id="address.postalCode"
                    name="address.postalCode"
                    value={profile.address?.postalCode || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.country" className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    id="address.country"
                    name="address.country"
                    value={profile.address?.country || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 accent-border pl-3">Account Security</h2>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Password changes and account security settings will be implemented in a future update.
              </p>
              
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium mb-1">Account Role</label>
                <input
                  type="text"
                  id="role"
                  value={profile.role || 'user'}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Your account permissions level</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Account Status</label>
                <div className="px-3 py-2 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Account Created</label>
                <div className="text-gray-700 dark:text-gray-300">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center justify-center min-w-32"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 