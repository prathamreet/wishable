/**
 * Comprehensive image domain configuration for the application
 * This serves as the single source of truth for all image domains
 */

// Domain patterns for Next.js remotePatterns configuration
// This allows us to match entire families of domains without listing each one
const domainPatterns = [
  // Amazon domains
  { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
  { protocol: 'https', hostname: 'images-eu.ssl-images-amazon.com' },
  { protocol: 'https', hostname: 'm.media-amazon.com' },
  { protocol: 'https', hostname: '**.amazon.com' },
  { protocol: 'https', hostname: '**.amazon.in' },
  { protocol: 'https', hostname: '**.amazonaws.com' },
  
  // Flipkart domains
  { protocol: 'https', hostname: 'rukminim1.flixcart.com' },
  { protocol: 'https', hostname: 'rukminim2.flixcart.com' },
  { protocol: 'https', hostname: 'rukmini1.flixcart.com' },
  { protocol: 'https', hostname: 'static-assets-web.flixcart.com' },
  { protocol: 'https', hostname: '**.flipkart.com' },
  { protocol: 'https', hostname: '**.flixcart.com' },
  
  // Myntra domains
  { protocol: 'https', hostname: 'assets.myntassets.com' },
  { protocol: 'https', hostname: '**.myntra.com' },
  { protocol: 'https', hostname: '**.myntassets.com' },
  
  // Snapdeal domains
  { protocol: 'https', hostname: 'g.sdlcdn.com' },
  { protocol: 'https', hostname: '**.snapdeal.com' },
  { protocol: 'https', hostname: '**.sdlcdn.com' },
  
  // Tata Cliq domains
  { protocol: 'https', hostname: 'img.tatacliq.com' },
  { protocol: 'https', hostname: '**.tatacliq.com' },
  
  // Ajio domains
  { protocol: 'https', hostname: 'assets.ajio.com' },
  { protocol: 'https', hostname: '**.ajio.com' },
  
  // Steam domains
  { protocol: 'https', hostname: 'shared.fastly.steamstatic.com' },
  { protocol: 'https', hostname: 'cdn.cloudflare.steamstatic.com' },
  { protocol: 'https', hostname: 'cdn.akamai.steamstatic.com' },
  { protocol: 'https', hostname: '**.steamstatic.com' },
  { protocol: 'https', hostname: '**.steampowered.com' },
  
  // Generic patterns for common image hosting services
  { protocol: 'https', hostname: '**.cloudfront.net' },
  { protocol: 'https', hostname: '**.akamaized.net' },
  { protocol: 'https', hostname: '**.cloudflare.com' },
  { protocol: 'https', hostname: '**.imgix.net' },
  { protocol: 'https', hostname: '**.staticflickr.com' },
  { protocol: 'https', hostname: '**.ggpht.com' },
  { protocol: 'https', hostname: '**.googleusercontent.com' },
  
  // Add other retailer domain patterns here
];

module.exports = {
  domainPatterns
};