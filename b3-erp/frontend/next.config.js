/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  generateBuildId: async () => {
    // Generate a unique build ID to avoid Next.js 14.1.0 build ID generation bug
    return 'build-' + Date.now()
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    // Domain (NestJS) backend base URL, including the /api/v1 global prefix.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
