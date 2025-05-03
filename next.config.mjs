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
  // Simplified headers configuration for same-origin requests
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'same-origin' },
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
    // Configure domains and patterns for both development and production
    domains: [
      'localhost',
      'g.sdlcdn.com',
      'images-na.ssl-images-amazon.com',
      'images-eu.ssl-images-amazon.com',
      'm.media-amazon.com',
      'assets.myntassets.com',
      'rukminim1.flixcart.com',
      'rukminim2.flixcart.com',
      'img.tatacliq.com',
      'static-assets-web.flixcart.com',
      'g.sdlcdn.com',
      'images-na.ssl-images-amazon.com',
      'images-eu.ssl-images-amazon.com',
      'm.media-amazon.com',
      'assets.myntassets.com',
      'rukminim1.flixcart.com',
      'rukminim2.flixcart.com',
      'img.tatacliq.com',
      'static-assets-web.flixcart.com',
      process.env.VERCEL_URL || 'wishable.vercel.app',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Optional: Configure image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    dangerouslyAllowSVG: true, // Allow SVG for our placeholder
    contentDispositionType: 'attachment',
  },
};

export default nextConfig;
