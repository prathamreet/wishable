'use client';
import { useState } from 'react';

const SUPPORTED_SITES = {
  'Popular Marketplaces': ['Amazon', 'Flipkart', 'Snapdeal'],
  'Fashion & Beauty': ['Myntra', 'Ajio', 'Nykaa'],
  'Electronics & Tech': ['Croma', 'Reliance Digital', 'Apple Store', 'Samsung', 'Dell', 'HP', 'Lenovo'],
  'Gaming': ['Games The Shop', 'Epic Games', 'Steam']
};

export default function WishlistForm({ onAdd, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [showSites, setShowSites] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a product URL');
      return;
    }
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      // Check if the domain is from a supported site
      const isSupported = Object.values(SUPPORTED_SITES).flat().some(site => 
        domain.includes(site.toLowerCase().replace(/\s+/g, ''))
      );
      
      if (!isSupported) {
        setError('This website is not supported. Please use one of the supported sites.');
        return;
      }
      
      setError('');
      await onAdd(url);
      setUrl('');
      setShowSites(false);
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Please enter a valid URL');
      } else {
        setError(err.message);
      }
    }
  };
  
  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Add to Wishlist
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setShowSites(true)}
                placeholder="Paste product URL from any supported site"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                disabled={isLoading}
              />
              
              <button
                type="button"
                onClick={() => setShowSites(!showSites)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={showSites ? 'Hide supported sites' : 'Show supported sites'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={showSites 
                      ? "M19 9l-7 7-7-7"
                      : "M9 5l7 7-7 7"} 
                  />
                </svg>
              </button>
            </div>
            
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding to Wishlist...
                </span>
              ) : (
                'Add to Wishlist'
              )}
            </button>
            
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>
      
      {showSites && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Supported Sites
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(SUPPORTED_SITES).map(([category, sites]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {category}
                </h4>
                <ul className="space-y-1">
                  {sites.map(site => (
                    <li key={site} className="text-sm text-gray-600 dark:text-gray-300">
                      {site}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}