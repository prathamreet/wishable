'use client';
import Image from 'next/image';
import { useState } from 'react';

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

export default function WishlistItem({ item, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const siteStyle = getSiteStyle(item.site);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      setIsDeleting(true);
      try {
        await onDelete(item._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <li className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="absolute top-0 right-0 m-2 z-10">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 bg-white dark:bg-gray-700 rounded-full shadow hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
          title="Remove from wishlist"
        >
          {isDeleting ? (
            <span className="block w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-col h-full">
        <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
          {!imageError ? (
            <Image
              src={item.thumbnail}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain"
              onError={() => setImageError(true)}
              priority={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="text-lg"
              title={item.site}
            >
              {siteStyle.icon}
            </span>
            <span 
              className="text-sm font-medium truncate"
              style={{ color: siteStyle.color }}
            >
              {item.site.replace(/\..+$/, '')}
            </span>
          </div>

          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {item.name}
          </h3>

          <div className="mt-auto">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {formatPrice(item.price)}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <time dateTime={item.scrapedAt} title="Last updated">
                {formatDate(item.scrapedAt)}
              </time>
              
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}