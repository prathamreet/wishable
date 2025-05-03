import { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';

export default function ProfileWishlistItem({ item, isFirst = false }) {
  const [imageError, setImageError] = useState(false);
  
  // Initialize image error state
  useEffect(() => {
    setImageError(!item.thumbnail);
  }, [item.thumbnail]);
  
  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }

  function getSiteIcon(site) {
    if (site.includes('amazon')) return '🛒';
    if (site.includes('flipkart')) return '🛍️';
    if (site.includes('myntra')) return '👕';
    if (site.includes('ajio')) return '👔';
    if (site.includes('nykaa')) return '💄';
    if (site.includes('snapdeal')) return '🏪';
    if (site.includes('croma')) return '📱';
    if (site.includes('reliancedigital')) return '🔌';
    if (site.includes('apple')) return '🍎';
    if (site.includes('samsung')) return '📱';
    if (site.includes('dell')) return '💻';
    if (site.includes('hp')) return '🖥️';
    if (site.includes('lenovo')) return '💻';
    if (site.includes('gamestheshop')) return '🎮';
    if (site.includes('epic')) return '🎮';
    if (site.includes('steam')) return '🎮';
    return '🌐';
  }

  return (
    <li className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
          <OptimizedImage
            src={item.thumbnail}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            onError={() => setImageError(true)}
            priority={isFirst}
          />
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span title={item.site}>{getSiteIcon(item.site)}</span>
            <span className="text-sm font-medium truncate">
              {item.site.replace(/\..+$/, '')}
            </span>
          </div>

          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {item.name}
          </h3>

          <div className="mt-auto">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatPrice(item.price)}
            </div>
            
            <div className="mt-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Product
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