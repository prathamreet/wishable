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
  const [imageSrc, setImageSrc] = useState('/images/placeholder.svg');
  
  // Set up the image source when the component mounts or src changes
  useEffect(() => {
    if (!src || src.trim() === '') {
      setImageSrc('/images/placeholder.svg');
      return;
    }
    
    // If the URL is already relative or from our domain, don't proxy it
    if (src.startsWith('/') || src.startsWith(process.env.NEXT_PUBLIC_APP_URL || '')) {
      setImageSrc(src);
      return;
    }
    
    try {
      // Validate URL before proxying
      new URL(src);
      
      // Check if the domain is in our allowed list (from next.config.mjs)
      const allowedDomains = [
        'g.sdlcdn.com',
        'images-na.ssl-images-amazon.com',
        'images-eu.ssl-images-amazon.com',
        'm.media-amazon.com',
        'assets.myntassets.com',
        'rukminim1.flixcart.com',
        'rukminim2.flixcart.com',
        'img.tatacliq.com',
        'static-assets-web.flixcart.com'
      ];
      
      const url = new URL(src);
      const isAllowedDomain = allowedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
      
      if (isAllowedDomain) {
        // If domain is allowed, use the original URL
        setImageSrc(src);
      } else {
        // Otherwise, proxy the URL through our API
        setImageSrc(`/api/image-proxy?url=${encodeURIComponent(src)}`);
      }
    } catch (e) {
      console.warn(`Invalid URL: ${src}`);
      setImageSrc('/images/placeholder.svg'); // Return placeholder for invalid URLs
    }
  }, [src]);
  
  // Handle image loading error
  const handleError = () => {
    console.warn(`Image failed to load: ${imageSrc}`);
    setError(true);
    setLoading(false);
    setImageSrc('/images/placeholder.svg');
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
        src={imageSrc}
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