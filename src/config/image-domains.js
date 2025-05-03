/**
 * Comprehensive image domain configuration for the application
 * This serves as the single source of truth for all image domains
 */

// Specific domains we know about (for backwards compatibility)
const specificDomains = [
  // Amazon
  'images-na.ssl-images-amazon.com',
  'images-eu.ssl-images-amazon.com',
  'm.media-amazon.com',
  
  // Flipkart
  'rukminim1.flixcart.com',
  'rukminim2.flixcart.com',
  'rukmini1.flixcart.com',
  'static-assets-web.flixcart.com',
  
  // Myntra
  'assets.myntassets.com',
  
  // Snapdeal
  'g.sdlcdn.com',
  
  // Tata Cliq
  'img.tatacliq.com',
  
  // Ajio
  'assets.ajio.com',
  
  // Steam
  'shared.fastly.steamstatic.com',
  'cdn.cloudflare.steamstatic.com',
  'cdn.akamai.steamstatic.com',
  
  // Add any other specific domains here
];

// Domain patterns for Next.js remotePatterns configuration
// This allows us to match entire families of domains without listing each one
const domainPatterns = [
  // Amazon domains
  { protocol: 'https', hostname: '**.amazon.com' },
  { protocol: 'https', hostname: '**.amazon.in' },
  { protocol: 'https', hostname: '**.amazonaws.com' },
  
  // Flipkart domains
  { protocol: 'https', hostname: '**.flipkart.com' },
  { protocol: 'https', hostname: '**.flixcart.com' },
  
  // Myntra domains
  { protocol: 'https', hostname: '**.myntra.com' },
  { protocol: 'https', hostname: '**.myntassets.com' },
  
  // Snapdeal domains
  { protocol: 'https', hostname: '**.snapdeal.com' },
  { protocol: 'https', hostname: '**.sdlcdn.com' },
  
  // Tata Cliq domains
  { protocol: 'https', hostname: '**.tatacliq.com' },
  
  // Ajio domains
  { protocol: 'https', hostname: '**.ajio.com' },
  
  // Steam domains
  { protocol: 'https', hostname: '**.steamstatic.com' },
  { protocol: 'https', hostname: '**.steampowered.com' },
  
  // Add other retailer domain patterns here
];

module.exports = {
  specificDomains,
  domainPatterns
};