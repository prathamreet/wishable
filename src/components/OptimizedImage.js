'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Optimized image component that uses Next.js Image component
 * for better performance and automatic optimization
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  onError = null,
  sizes = "100vw",
  quality = 75,
  forceProxy
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Use placeholder if no src provided
  const imageSrc = src && src.trim() !== '' ? src : '/images/placeholder.svg';
  
  // Handle image loading error
  const handleError = () => {
    console.warn(`Image failed to load: ${imageSrc}`);
    setError(true);
    setLoading(false);
    if (onError) onError();
  };
  
  // Handle image load success
  const handleLoad = () => {
    setLoading(false);
  };
  
  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-primary-500 dark:border-t-primary-400 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={error ? '/images/placeholder.svg' : imageSrc}
        alt={alt || "Product image"}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        style={{ objectFit: 'contain' }}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
        quality={quality}
      />
    </>
  );
}