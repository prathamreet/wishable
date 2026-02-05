'use client';
import { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';

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
  
  useEffect(() => {
    setImageError(!item.thumbnail);
  }, [item.thumbnail]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      setIsDeleting(true);
      try {
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
    <li className="border border-neutral-200 hover:border-neutral-900 transition-all duration-200">
      <div className="flex flex-col h-full">
        {/* Image Section */}
        <div className="relative h-48 bg-neutral-50 overflow-hidden border-b border-neutral-200">
          <OptimizedImage
            src={item.thumbnail}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            onError={() => setImageError(true)}
            priority={isFirst}
          />
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-3 right-3 p-2 bg-white border border-neutral-900 hover:bg-neutral-950 hover:text-white transition-colors disabled:opacity-50"
            title="Remove from wishlist"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {item.name}
          </h3>

          {/* Site */}
          <p className="text-xs text-neutral-600">
            {item.site.replace(/\..+$/, '')}
          </p>

          {/* Price and Actions */}
          <div className="mt-auto space-y-3">
            {/* Price */}
            <div className="border-t border-neutral-200 pt-3">
              <div className="text-2xl font-semibold tracking-tight">
                {formatPrice(item.price)}
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="flex items-center justify-between">
              {/* Date */}
              <time dateTime={item.scrapedAt} className="text-xs text-neutral-600" title="Last updated">
                {formatDate(item.scrapedAt)}
              </time>
              
              {/* View Link */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-neutral-900 hover:bg-neutral-950 hover:text-white px-3 py-1.5 transition-colors text-xs font-medium inline-flex items-center gap-1.5"
              >
                <span>View</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
