/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Vercel serverless — prevents bundling Node.js-only modules
  // into the edge/client bundle
  serverExternalPackages: [],

  // Disable ESLint blocking the build (warnings still show)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable type-check blocking the build (tsc runs separately in CI)
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
