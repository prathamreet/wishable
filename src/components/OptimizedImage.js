'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * OptimizedImage component
 * A wrapper around Next.js Image component that uses our image proxy
 * This allows us to display images from any domain without configuration
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  fill = false,
  width,
  height,
  sizes = "100vw",
  className = "",
  priority = false,
  quality = 75,
  onError = null
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Function to create a proxied URL
  const getProxiedUrl = (url) => {
    // If no URL is provided, return a placeholder image URL
    if (!url || url.trim() === '') {
      return '/images/placeholder.svg';
    }
    
    // If the URL is already relative or from our domain, don't proxy it
    if (url.startsWith('/') || url.startsWith(process.env.NEXT_PUBLIC_APP_URL || '')) {
      return url;
    }
    
    try {
      // Validate URL before proxying
      new URL(url);
      // If valid, proxy the URL through our API
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    } catch (e) {
      console.warn(`Invalid URL: ${url}`);
      return '/images/placeholder.svg'; // Return placeholder for invalid URLs
    }
  };
  
  // Handle image loading error
  const handleError = () => {
    setError(true);
    setLoading(false);
    if (onError) onError();
  };
  
  // Handle image load success
  const handleLoad = () => {
    setLoading(false);
  };
  
  // If there's an error or no src, use the placeholder image with Next.js Image
  if (error || !src) {
    return (
      <Image
        src="/images/placeholder.svg"
        alt={alt || "Placeholder image"}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        className={className}
        priority={priority}
        quality={quality}
      />
    );
  }
  
  // Use the proxied URL with Next.js Image component
  const proxiedSrc = getProxiedUrl(src);
  
  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={proxiedSrc}
        alt={alt || "Product image"}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        quality={quality}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  );
}