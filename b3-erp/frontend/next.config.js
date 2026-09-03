/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Emit a self-contained server (.next/standalone/server.js) so the Docker
  // runtime image stays small and boots with a few hundred MB — the heavy part
  // is the build (~7GB), which runs in CI, not on the Render runtime box.
  output: 'standalone',
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
    // ESLint is run separately; keep it out of the production build to avoid
    // failing on style-only lint rules. Typecheck IS enforced (below).
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Typecheck is now clean (npx tsc --noEmit → 0 errors); enforce it in the build.
    ignoreBuildErrors: false,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
