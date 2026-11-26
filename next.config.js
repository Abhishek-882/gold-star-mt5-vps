/** @type {import('next').NextConfig} */
const nextConfig = {

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
