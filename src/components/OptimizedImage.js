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
    className: `${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`,
    onError: handleError,
    onLoad: handleLoad,
    style: { objectFit: 'contain' }
  };
  
  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 via-indigo-500/5 to-purple-500/5 dark:from-gray-800/20 dark:via-gray-700/10 dark:to-indigo-900/10 backdrop-blur-sm">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
          
          {/* Loading content */}
          <div className="relative flex flex-col items-center gap-3">
            {/* Enhanced spinner */}
            <div className="relative">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-md animate-pulse"></div>
              
              {/* Main spinner */}
              <div className="relative w-8 h-8 border-3 border-transparent bg-gradient-to-r from-indigo-400 to-purple-500 dark:from-indigo-300 dark:to-purple-400 rounded-full animate-spin">
                <div className="absolute inset-1 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-full"></div>
              </div>
            </div>
            
            {/* Loading text */}
            <div className="text-xs text-indigo-200 dark:text-gray-400 font-medium">
              Loading...
            </div>
            
            {/* Animated dots */}
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-indigo-400/60 dark:bg-indigo-500/60 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-purple-400/60 dark:bg-purple-500/60 rounded-full animate-bounce delay-75"></div>
              <div className="w-1 h-1 bg-indigo-400/60 dark:bg-indigo-500/60 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-400/10 to-pink-500/10 dark:from-red-500/10 dark:to-pink-600/10 backdrop-blur-sm border border-red-400/20 dark:border-red-500/20 rounded-lg">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-red-400/20 to-pink-500/20 dark:from-red-500/20 dark:to-pink-600/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-red-400/30 dark:border-red-500/30">
              <span className="text-lg">📷</span>
            </div>
            <p className="text-xs text-red-300 dark:text-red-400 font-medium">
              Image unavailable
            </p>
          </div>
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
