'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Optimized image component that uses Next.js Image component for internal images
 * and regular img tag for external images to avoid configuration issues
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
  
  // Check if the image is an internal image (starts with /) or an external URL
  const isInternalImage = imageSrc.startsWith('/') || imageSrc.startsWith('data:');
  
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
  
  // Common image props
  const imageProps = {
    src: error ? '/images/placeholder.svg' : imageSrc,
    alt: alt || "Product image", // Ensure alt is always provided
    className: `${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: handleError,
    onLoad: handleLoad,
    style: { objectFit: 'contain' }
  };
  
  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-primary-500 dark:border-t-primary-400 rounded-full animate-spin"></div>
        </div>
      )}
      
      {isInternalImage ? (
        // Use Next.js Image component for internal images
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image
          {...imageProps}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          sizes={sizes}
          quality={quality}
        />
      ) : (
        // Use regular img tag for external images
        // We're intentionally using img instead of Next.js Image here because:
        // 1. External domains would need to be added to next.config.js
        // 2. Some external images might not support optimization
        // 3. We want to avoid CORS issues with external images
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img
          {...imageProps}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          style={{
            ...imageProps.style,
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
            position: fill ? 'absolute' : 'relative',
            inset: fill ? 0 : 'auto'
          }}
        />
      )}
    </>
  );
}