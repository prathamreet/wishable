/**
 * Comprehensive image domain configuration for WishAble
 * Aligned with supported scraping sites: Amazon, Flipkart, Myntra, Ajio, Nykaa, Zara, Steam, Epic Games
 */

const domainPatterns = [
  // Amazon domains - Enhanced coverage
  { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
  { protocol: 'https', hostname: 'images-eu.ssl-images-amazon.com' },
  { protocol: 'https', hostname: 'm.media-amazon.com' },
  { protocol: 'https', hostname: '**.amazon.com' },
  { protocol: 'https', hostname: '**.amazon.in' },
  { protocol: 'https', hostname: '**.amazon.co.uk' },
  { protocol: 'https', hostname: '**.amazon.de' },
  { protocol: 'https', hostname: '**.amazon.fr' },
  { protocol: 'https', hostname: '**.amazonaws.com' },
  
  // Flipkart domains - Comprehensive coverage
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
  
  // Ajio domains
  { protocol: 'https', hostname: 'assets.ajio.com' },
  { protocol: 'https', hostname: '**.ajio.com' },
  
  // Nykaa domains - ADDED (was missing)
  { protocol: 'https', hostname: 'images-static.nykaa.com' },
  { protocol: 'https', hostname: 'adn-static1.nykaa.com' },
  { protocol: 'https', hostname: '**.nykaa.com' },
  { protocol: 'https', hostname: '**.nykaafashion.com' },
  
  // Zara domains - ADDED (was missing)
  { protocol: 'https', hostname: 'static.zara.net' },
  { protocol: 'https', hostname: '**.zara.com' },
  { protocol: 'https', hostname: '**.zara.net' },
  
  // Steam domains - Enhanced
  { protocol: 'https', hostname: 'shared.fastly.steamstatic.com' },
  { protocol: 'https', hostname: 'cdn.cloudflare.steamstatic.com' },
  { protocol: 'https', hostname: 'cdn.akamai.steamstatic.com' },
  { protocol: 'https', hostname: '**.steamstatic.com' },
  { protocol: 'https', hostname: '**.steampowered.com' },
  
  // Epic Games domains - ADDED (was missing)
  { protocol: 'https', hostname: 'cdn1.epicgames.com' },
  { protocol: 'https', hostname: 'cdn2.epicgames.com' },
  { protocol: 'https', hostname: '**.epicgames.com' },
  { protocol: 'https', hostname: '**.unrealengine.com' },
  
  // Generic CDN patterns for broad compatibility
  { protocol: 'https', hostname: '**.cloudfront.net' },
  { protocol: 'https', hostname: '**.akamaized.net' },
  { protocol: 'https', hostname: '**.cloudflare.com' },
  { protocol: 'https', hostname: '**.imgix.net' },
  { protocol: 'https', hostname: '**.fastly.com' },
  { protocol: 'https', hostname: '**.jsdelivr.net' },
  
  // Common image hosting services
  { protocol: 'https', hostname: '**.googleusercontent.com' },
  { protocol: 'https', hostname: '**.ggpht.com' },
  { protocol: 'https', hostname: '**.staticflickr.com' },
  { protocol: 'https', hostname: 'i.imgur.com' },
  { protocol: 'https', hostname: '**.wikimedia.org' },
];

// Export configuration
module.exports = {
  domainPatterns,
  
  // Helper functions for domain management
  getSupportedDomains: () => {
    return domainPatterns.map(pattern => pattern.hostname);
  },
  
  isDomainSupported: (hostname) => {
    return domainPatterns.some(pattern => {
      if (pattern.hostname.startsWith('**')) {
        const domain = pattern.hostname.substring(3);
        return hostname.includes(domain);
      }
      return hostname === pattern.hostname;
    });
  }
};
