'use client';
import { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';

// Site icons and colors for branding
const SITE_STYLES = {
  amazon: { color: '#FF9900', icon: '🛒' },
  flipkart: { color: '#2874F0', icon: '🛍️' },
  myntra: { color: '#E4126B', icon: '👕' },
  ajio: { color: '#2C4152', icon: '👔' },
  nykaa: { color: '#E80071', icon: '💄' },
  snapdeal: { color: '#E40046', icon: '🏪' },
  croma: { color: '#00B1E1', icon: '📱' },
  reliancedigital: { color: '#1A3BE2', icon: '🔌' },
  apple: { color: '#555555', icon: '🍎' },
  samsung: { color: '#1428A0', icon: '📱' },
  dell: { color: '#007DB8', icon: '💻' },
  hp: { color: '#0096D6', icon: '🖥️' },
  lenovo: { color: '#E2231A', icon: '💻' },
  gamestheshop: { color: '#1B1B1B', icon: '🎮' },
  epicgames: { color: '#2F2F2F', icon: '🎮' },
  steam: { color: '#171A21', icon: '🎮' }
};

function getSiteStyle(domain) {
  const siteKey = Object.keys(SITE_STYLES).find(key => domain.includes(key));
  return siteKey ? SITE_STYLES[siteKey] : { color: '#718096', icon: '🌐' };
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export default function WishlistItem({ item, onDelete, isFirst = false }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const siteStyle = getSiteStyle(item.site);
  
  // Initialize image error state
  useEffect(() => {
    setImageError(!item.thumbnail);
  }, [item.thumbnail]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      setIsDeleting(true);
      try {
        // Use either _id or clientId, whichever is available
        const itemId = item._id || item.clientId;
        if (itemId) {
          await onDelete(itemId);
        } else {
          throw new Error('Item has no valid ID');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <li className="relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 rounded-xl shadow-xl hover:shadow-2xl hover:bg-white/15 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-102 overflow-hidden group">
      
      {/* Delete Button - Always Visible */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 bg-red-500/80 dark:bg-red-500/70 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-500 dark:hover:bg-red-500/90 transition-all duration-300 border border-red-400/50 dark:border-red-400/60 transform hover:scale-105 cursor-pointer"
          title="Remove from wishlist"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-col h-full">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-700/30 dark:to-gray-800/30 overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
          
          <OptimizedImage
            src={item.thumbnail}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            priority={isFirst}
          />
          
          {/* Site Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-lg px-2 py-1 flex items-center gap-1.5">
              <span className="text-sm" title={item.site}>
                {siteStyle.icon}
              </span>
              <span 
                className="text-xs font-medium text-white dark:text-gray-200"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              >
                {item.site.replace(/\..+$/, '')}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-white dark:text-gray-200 text-sm leading-tight line-clamp-2 group-hover:text-indigo-100 dark:group-hover:text-gray-100 transition-colors duration-300">
            {item.name}
          </h3>

          {/* Price and Actions */}
          <div className="mt-auto space-y-3">
            {/* Price */}
            <div className="bg-white/10 dark:bg-gray-700/30 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg p-2">
              <div className="text-lg font-bold bg-gradient-to-r from-green-300 to-green-400 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
                {formatPrice(item.price)}
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="flex items-center justify-between">
              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-indigo-200 dark:text-gray-400">
                <span className="w-2 h-2 bg-indigo-400/60 rounded-full"></span>
                <time dateTime={item.scrapedAt} title="Last updated">
                  {formatDate(item.scrapedAt)}
                </time>
              </div>
              
              {/* View Link */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-3 py-1.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center gap-1.5 text-xs shadow-lg"
              >
                <span>View</span>
                <svg className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"></div>
    </li>
  );
}
