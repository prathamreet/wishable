'use client';
import { useState, useRef, useEffect } from 'react';
import { SITE_CATEGORIES } from '../lib/siteCategories';

// Convert SITE_CATEGORIES to the format needed for the form
const SUPPORTED_SITES = Object.entries(SITE_CATEGORIES).reduce((acc, [category, sites]) => {
  acc[category] = Object.values(sites);
  return acc;
}, {});

export default function WishlistForm({ onAdd, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [showSites, setShowSites] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState('');
  const [scrapingLogs, setScrapingLogs] = useState([]);
  const [showDetailedStatus, setShowDetailedStatus] = useState(false);
  
  // Reference to the terminal logs container
  const logsContainerRef = useRef(null);
  
  // Auto-scroll to the bottom of the terminal when new logs are added
  useEffect(() => {
    if (logsContainerRef.current && showDetailedStatus) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [scrapingLogs, showDetailedStatus]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a product URL');
      return;
    }
    
    try {
      // Reset previous state
      setError('');
      setScrapingLogs([]);
      setShowDetailedStatus(true);
      
      // Add initial log entry
      addScrapingLog('Starting product detection process...');
      
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      addScrapingLog(`Validating URL: ${url}`);
      addScrapingLog(`Detected domain: ${domain}`);
      
      // We now support many sites, so we'll be more lenient
      // Just do a basic URL validation
      if (!domain.includes('.')) {
        setError('Please enter a valid product URL');
        addScrapingLog('Error: Invalid domain format', 'error');
        return;
      }
      
      // Optional: Check if it's likely a product URL
      const isLikelyProduct = /product|item|dp\/|\/p\/|\/pd\/|\/ip\/|\/app\/|\/game\//.test(url);
      if (!isLikelyProduct) {
        setError('This doesn\'t appear to be a product URL. Please make sure you\'re using a direct link to a product.');
        addScrapingLog('Error: URL does not appear to be a product page', 'error');
        return;
      }
      
      addScrapingLog('URL validation successful');
      setScrapingStatus('Initializing scraper...');
      
      // Create a wrapper for onAdd that updates scraping logs
      const wrappedOnAdd = async (url) => {
        try {
          addScrapingLog('Connecting to product page...');
          
          // Simulate step-by-step scraping process with timeouts
          setTimeout(() => addScrapingLog('Downloading page content...'), 500);
          setTimeout(() => addScrapingLog('Analyzing HTML structure...'), 1200);
          setTimeout(() => addScrapingLog('Extracting product information...'), 2000);
          
          // Call the actual onAdd function
          const result = await onAdd(url);
          
          // Add success log
          setTimeout(() => {
            addScrapingLog('Product information successfully extracted', 'success');
            addScrapingLog('Adding item to your wishlist...', 'success');
          }, 2800);
          
          return result;
        } catch (error) {
          // Log the error but let the outer catch block handle it
          addScrapingLog(`Error: ${error.message}`, 'error');
          throw error;
        }
      };
      
      // Execute the wrapped function
      await wrappedOnAdd(url);
      
      // Clear form after successful addition
      setTimeout(() => {
        setUrl('');
        setShowSites(false);
        setScrapingStatus('');
        addScrapingLog('Product successfully added to your wishlist!', 'success');
      }, 3500);
      
    } catch (err) {
      setScrapingStatus(''); // Clear scraping status on error
      
      if (err instanceof TypeError) {
        setError('Please enter a valid URL');
        addScrapingLog('Error: Invalid URL format', 'error');
      } else if (err.message && (
          err.message.includes('Rate limited') || 
          err.message.includes('HTTP 529') ||
          (err.status && (err.status === 429 || err.status === 529))
      )) {
        setError('This website is currently blocking our automatic product detection. Please try again later or provide manual details.');
        addScrapingLog('Error: Website is blocking our scraper (rate limited)', 'error');
      } else if (err.message && (
          err.message.includes('Access denied') || 
          (err.status && err.status === 403)
      )) {
        setError('This website is blocking access. Please try a different product or provide manual details.');
        addScrapingLog('Error: Access denied by website', 'error');
      } else if (err.message && err.message.includes('Server error')) {
        setError('The website is experiencing issues. Please try again later.');
        addScrapingLog('Error: Target website server error', 'error');
      } else if (err.message && err.message.includes('timed out')) {
        setError('The request timed out. The website might be slow or blocking our requests.');
        addScrapingLog('Error: Request timed out', 'error');
      } else if (err.message && err.message.includes('maxRedirects')) {
        setError('Maximum number of redirects exceeded. The website might be using redirect loops.');
        addScrapingLog('Error: Too many redirects detected', 'error');
      } else {
        setError(err.message || 'An error occurred while adding the item');
        addScrapingLog(`Error: ${err.message || 'Unknown error occurred'}`, 'error');
      }
    }
  };
  
  // Helper function to add a log entry with timestamp
  const addScrapingLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setScrapingLogs(prev => [...prev, { message, timestamp, type }]);
  };
  
  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Add to Wishlist
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Paste a product URL from any supported site, including gaming platforms like Steam, Epic Games, PlayStation Store, and more!
        </p>
        
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
            
            {scrapingStatus && !error && (
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {scrapingStatus}
              </p>
            )}
          </div>
          
          {/* Terminal-like scraping log display */}
          {showDetailedStatus && scrapingLogs.length > 0 && (
            <div className="bg-gray-900 text-gray-100 rounded-md p-3 font-mono text-xs h-64 relative">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 text-xs">Scraping Process Terminal</div>
                <button 
                  onClick={() => setShowDetailedStatus(false)}
                  className="text-gray-400 hover:text-white"
                  title="Close terminal"
                >
                  ×
                </button>
              </div>
              
              <div ref={logsContainerRef} className="space-y-1 absolute inset-x-3 bottom-3 top-12 overflow-y-auto scrollbar-hide">
                {scrapingLogs.map((log, index) => (
                  <div key={index} className="flex">
                    <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                    <span className={`
                      ${log.type === 'error' ? 'text-red-400' : ''}
                      ${log.type === 'success' ? 'text-green-400' : ''}
                      ${log.type === 'info' ? 'text-blue-400' : ''}
                      ${log.type === 'warning' ? 'text-yellow-400' : ''}
                    `}>
                      {log.message}
                    </span>
                  </div>
                ))}
                
                {/* Blinking cursor effect - always at the bottom */}
                {isLoading && (
                  <div className="mt-1 flex items-center">
                    <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-blue-400">Processing</span>
                    <span className="ml-1 w-2 h-4 bg-gray-100 animate-pulse"></span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 flex-wrap">
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
            
            {scrapingLogs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDetailedStatus(!showDetailedStatus)}
                className="px-3 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={showDetailedStatus 
                      ? "M19 9l-7 7-7-7" 
                      : "M9 5l7 7-7 7"} 
                  />
                </svg>
                {showDetailedStatus ? 'Hide Terminal' : 'Show Terminal'}
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
                    <li key={site} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span>
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