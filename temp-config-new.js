/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'g.sdlcdn.com',
      'images-na.ssl-images-amazon.com',
      'images-eu.ssl-images-amazon.com',
      'm.media-amazon.com',
      'assets.myntassets.com',
      'rukminim1.flixcart.com',
      'rukminim2.flixcart.com',
      'rukmini1.flixcart.com',
      'img.tatacliq.com',
      'static-assets-web.flixcart.com',
      'assets.ajio.com'
    ],
  },
}

module.exports = nextConfig