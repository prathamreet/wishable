/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
  },
  // Enable better app directory support
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Properly handle API routes with better CORS support
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  // Define proper API route handling
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  images: {
    domains: [
      // Amazon
      'm.media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'images-eu.ssl-images-amazon.com',
      'images.amazon.com',
      
      // Flipkart
      'rukminim1.flixcart.com',
      'rukmini1.flixcart.com',
      'rukminim2.flixcart.com',
      'rukmini2.flixcart.com',
      'assets.myntassets.com',
      
      // Myntra
      'assets.myntassets.com',
      'images.myntassets.com',
      
      // Ajio
      'assets.ajio.com',
      'images.ajio.com',
      
      // Nykaa
      'images-static.nykaa.com',
      'adn-static1.nykaa.com',
      'adn-static2.nykaa.com',
      
      // Snapdeal
      'n1.sdlcdn.com',
      'n2.sdlcdn.com',
      'n3.sdlcdn.com',
      'n4.sdlcdn.com',
      
      // Croma
      'media.croma.com',
      'cdn.croma.com',
      
      // Reliance Digital
      'www.reliancedigital.in',
      'images.reliancedigital.in',
      
      // Apple
      'store.storeimages.cdn-apple.com',
      'images.apple.com',
      
      // Samsung
      'images.samsung.com',
      'img.samsung.com',
      
      // Dell
      'i.dell.com',
      'snpi.dell.com',
      
      // HP
      'ssl-product-images.www8-hp.com',
      'store.hp.com',
      
      // Lenovo
      'www.lenovo.com',
      'static.lenovo.com',
      
      // Games The Shop
      'www.gamestheshop.com',
      'cdn.gamestheshop.com',
      
      // Epic Games
      'cdn.epicgames.com',
      'cdn1.epicgames.com',
      'cdn2.epicgames.com',
      
      // Steam
      'cdn.akamai.steamstatic.com',
      'cdn.cloudflare.steamstatic.com',
      'steamcdn-a.akamaihd.net',
      'steamcdn-b.akamaihd.net',
      'shared.fastly.steamstatic.com',
      'store.steampowered.com'
    ],
    // Optional: Configure image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
};

export default nextConfig;
