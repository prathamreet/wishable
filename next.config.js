/** @type {import('next').NextConfig} */
const { specificDomains, domainPatterns } = require('./src/config/image-domains');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: specificDomains,
    remotePatterns: domainPatterns,
  },
}

module.exports = nextConfig