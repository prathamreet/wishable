'use client';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, isLoading } = useContext(AuthContext);
  const toast = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    notifyOnPriceChange: true,
    notifyOnStockChange: true,
    emailFrequency: 'daily',
    theme: 'system',
  });

  useEffect(() => {
    if (user) {
      // Populate form with user data
      setFormData({
        email: user.email || '',
        username: user.username || '',
        notifyOnPriceChange: user.preferences?.notifyOnPriceChange ?? true,
        notifyOnStockChange: user.preferences?.notifyOnStockChange ?? true,
        emailFrequency: user.preferences?.emailFrequency || 'daily',
        theme: user.preferences?.theme || 'system',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success toast
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
      console.error('Settings save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  if (!user) {
    router.push('/login?redirect=%2Fsettings');
    return <LoadingSpinner message="Redirecting to login..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-light-text dark:text-dark-text">Account Settings</h1>
      
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Profile Information</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                disabled={saving}
              />
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                disabled={saving}
              />
            </div>
            
            <div className="pt-4 border-t border-light-border dark:border-dark-border">
              <h3 className="text-lg font-medium mb-4 text-light-text dark:text-dark-text">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyOnPriceChange"
                    name="notifyOnPriceChange"
                    checked={formData.notifyOnPriceChange}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-light-border dark:border-dark-border rounded"
                    disabled={saving}
                  />
                  <label htmlFor="notifyOnPriceChange" className="ml-2 block text-sm text-light-text dark:text-dark-text">
                    Notify me when prices change
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyOnStockChange"
                    name="notifyOnStockChange"
                    checked={formData.notifyOnStockChange}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-light-border dark:border-dark-border rounded"
                    disabled={saving}
                  />
                  <label htmlFor="notifyOnStockChange" className="ml-2 block text-sm text-light-text dark:text-dark-text">
                    Notify me when items come back in stock
                  </label>
                </div>
                
                <div>
                  <label htmlFor="emailFrequency" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                    Email Frequency
                  </label>
                  <select
                    id="emailFrequency"
                    name="emailFrequency"
                    value={formData.emailFrequency}
                    onChange={handleChange}
                    className="form-input"
                    disabled={saving}
                  >
                    <option value="realtime">Real-time</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-light-border dark:border-dark-border">
              <h3 className="text-lg font-medium mb-4 text-light-text dark:text-dark-text">Appearance</h3>
              
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  Theme Preference
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="form-input"
                  disabled={saving}
                >
                  <option value="system">System Default</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
                <p className="mt-1 text-sm text-light-text/60 dark:text-dark-text/60">
                  You can also toggle between light and dark mode using the button in the navigation bar.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={saving}
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
          </div>
        </form>
      </div>
      
      <div className="card p-6 border-red-200 dark:border-red-800">
        <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
        <p className="text-light-text/70 dark:text-dark-text/70 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          onClick={() => toast.warning('This feature is not implemented yet.')}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}