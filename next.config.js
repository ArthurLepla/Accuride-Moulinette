/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    unoptimized: true,
    remotePatterns: [],
  },
  output: 'standalone',
}

module.exports = nextConfig
