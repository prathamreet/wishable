/** @type {import('next').NextConfig} */
const { domainPatterns } = require('./src/config/image-domains');

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: domainPatterns,
  },
}

module.exports = nextConfig