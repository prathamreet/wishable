'use client';
import { useState, useRef, useEffect } from 'react';

export default function WishlistForm({ onAdd, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [scrapingStatus, setScrapingStatus] = useState('');
  const [scrapingLogs, setScrapingLogs] = useState([]);
  const [showDetailedStatus, setShowDetailedStatus] = useState(false);
  
  const logsContainerRef = useRef(null);
  
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
      setError('');
      setScrapingLogs([]);
      setShowDetailedStatus(true);
      
      addScrapingLog('Starting product detection...');
      
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      addScrapingLog(`Validating URL: ${url}`);
      addScrapingLog(`Detected domain: ${domain}`);
      
      if (!domain.includes('.')) {
        setError('Please enter a valid product URL');
        addScrapingLog('Error: Invalid domain format', 'error');
        return;
      }
      
      const isLikelyProduct = /product|item|dp\/|\/p\/|\/pd\/|\/ip\/|\/app\/|\/game\//.test(url);
      if (!isLikelyProduct) {
        setError('This doesn\'t appear to be a product URL. Please make sure you\'re using a direct link to a product.');
        addScrapingLog('Error: URL does not appear to be a product page', 'error');
        return;
      }
      
      addScrapingLog('URL validation successful');
      setScrapingStatus('Initializing scraper...');
      
      const wrappedOnAdd = async (url) => {
        try {
          addScrapingLog('Connecting to product page...');
          
          setTimeout(() => addScrapingLog('Downloading page content...'), 500);
          setTimeout(() => addScrapingLog('Analyzing HTML structure...'), 1200);
          setTimeout(() => addScrapingLog('Extracting product information...'), 2000);
          
          const result = await onAdd(url);
          
          setTimeout(() => {
            addScrapingLog('Product information extracted', 'success');
            addScrapingLog('Adding item to wishlist...', 'success');
          }, 2800);
          
          return result;
        } catch (error) {
          addScrapingLog(`Error: ${error.message}`, 'error');
          throw error;
        }
      };
      
      await wrappedOnAdd(url);
      
      setTimeout(() => {
        setUrl('');
        setScrapingStatus('');
        addScrapingLog('Product added successfully!', 'success');
      }, 3500);
      
    } catch (err) {
      setScrapingStatus('');
      
      if (err instanceof TypeError) {
        setError('Please enter a valid URL');
        addScrapingLog('Error: Invalid URL format', 'error');
      } else if (err.message && (
          err.message.includes('Rate limited') || 
          err.message.includes('HTTP 529') ||
          (err.status && (err.status === 429 || err.status === 529))
      )) {
        setError('Website is blocking automatic detection. Try again later.');
        addScrapingLog('Error: Rate limited', 'error');
      } else if (err.message && (
          err.message.includes('Access denied') || 
          (err.status && err.status === 403)
      )) {
        setError('Website is blocking access. Try a different product.');
        addScrapingLog('Error: Access denied', 'error');
      } else if (err.message && err.message.includes('Server error')) {
        setError('Website is experiencing issues. Try again later.');
        addScrapingLog('Error: Server error', 'error');
      } else if (err.message && err.message.includes('timed out')) {
        setError('Request timed out. Website might be slow.');
        addScrapingLog('Error: Timeout', 'error');
      } else {
        setError(err.message || 'Failed to add item');
        addScrapingLog(`Error: ${err.message || 'Unknown error'}`, 'error');
      }
    }
  };
  
  const addScrapingLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setScrapingLogs(prev => [...prev, { message, timestamp, type }]);
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="form-label">
              Product URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste product URL from any supported site..."
              className="form-input"
              disabled={isLoading}
            />
            <p className="text-xs text-neutral-600">
              Paste a direct link to any product from Amazon, Steam, or other supported stores
            </p>
          </div>
          
          {error && (
            <div className="border border-red-600 bg-red-50 text-red-900 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          
          {scrapingStatus && !error && (
            <div className="border border-blue-600 bg-blue-50 text-blue-900 px-4 py-3 text-sm flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              {scrapingStatus}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add to Wishlist"}
          </button>
          
          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="btn-secondary"
            >
              Clear
            </button>
          )}
          
          {scrapingLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDetailedStatus(!showDetailedStatus)}
              className="btn-outline"
            >
              {showDetailedStatus ? 'Hide Logs' : 'Show Logs'}
            </button>
          )}
        </div>
      </form>

      {showDetailedStatus && scrapingLogs.length > 0 && (
        <div className="border border-neutral-900 bg-neutral-950 text-neutral-50 overflow-hidden">
          <div className="border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-mono text-neutral-400">Terminal</span>
            </div>
            <button 
              onClick={() => setShowDetailedStatus(false)}
              className="text-neutral-400 hover:text-neutral-50 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="p-4">
            <div ref={logsContainerRef} className="font-mono text-xs h-64 overflow-y-auto space-y-1">
              {scrapingLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-neutral-600 flex-shrink-0">[{log.timestamp}]</span>
                  <span className={`flex-1 ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'success' ? 'text-green-400' : 
                    'text-neutral-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-2 mt-2">
                  <span className="text-neutral-600 flex-shrink-0">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-neutral-300 flex items-center gap-1">
                    Processing
                    <span className="w-1.5 h-3 bg-neutral-300 animate-pulse ml-1"></span>
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
