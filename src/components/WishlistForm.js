'use client';
import { useState, useRef, useEffect } from 'react';

export default function WishlistForm({ onAdd, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
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
    <div className="space-y-6">
      {/* Main Form */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white dark:text-gray-200">
                Product URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste any product URL from supported sites..."
                  className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:border-white dark:focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-400/20 transition-all duration-300"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400/80 to-blue-500/80 dark:from-green-400/60 dark:to-blue-500/60 rounded-full flex items-center justify-center">
                    <span className="text-xs">🔗</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-indigo-100 dark:text-gray-400">
                Paste a direct link to any product from Amazon, Steam, or other supported stores
              </p>
            </div>
            
            {error && (
              <div className="bg-red-400/20 dark:bg-red-500/20 border border-red-400/30 dark:border-red-500/30 text-red-200 dark:text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </div>
              </div>
            )}
            
            {scrapingStatus && !error && (
              <div className="bg-blue-400/20 dark:bg-blue-500/20 border border-blue-400/30 dark:border-blue-500/30 text-blue-200 dark:text-blue-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  {scrapingStatus}
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="group bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding to Wishlist...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Add to Wishlist</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </>
              )}
            </button>
            
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center gap-2"
              >
                <span>🗑️</span>
                Clear
              </button>
            )}
            
            {scrapingLogs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDetailedStatus(!showDetailedStatus)}
                className="bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center gap-2"
              >
                <span>🔍</span>
                <span>{showDetailedStatus ? 'Hide Terminal' : 'Show Terminal'}</span>
                <svg className={`w-4 h-4 transition-transform ${showDetailedStatus ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Enhanced Terminal Display */}
      {showDetailedStatus && scrapingLogs.length > 0 && (
        <div className="bg-gray-900/90 dark:bg-black/50 backdrop-blur-md border border-gray-600/30 dark:border-gray-500/30 rounded-xl shadow-2xl overflow-hidden">
          {/* Terminal Header */}
          <div className="bg-gray-800/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-600/30 dark:border-gray-500/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm font-mono">
                  <span>💻</span>
                  <span>Scraping Process Terminal</span>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailedStatus(false)}
                className="text-gray-400 hover:text-white transition-colors text-lg"
                title="Close terminal"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Terminal Content */}
          <div className="p-4">
            <div ref={logsContainerRef} className="font-mono text-sm h-64 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {scrapingLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-500 text-xs flex-shrink-0">[{log.timestamp}]</span>
                  <span className={`flex-1 ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'success' ? 'text-green-400' : 
                    log.type === 'warning' ? 'text-yellow-400' : 
                    'text-blue-400'
                  }`}>
                    {log.type === 'error' && '❌ '}
                    {log.type === 'success' && '✅ '}
                    {log.type === 'warning' && '⚠️ '}
                    {log.type === 'info' && '🔄 '}
                    {log.message}
                  </span>
                </div>
              ))}
              
              {/* Animated cursor */}
              {isLoading && (
                <div className="flex items-start gap-2 mt-2">
                  <span className="text-gray-500 text-xs flex-shrink-0">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-blue-400 flex items-center gap-1">
                    🔄 Processing
                    <span className="w-2 h-4 bg-blue-400 animate-pulse ml-1"></span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
