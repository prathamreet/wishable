/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
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
