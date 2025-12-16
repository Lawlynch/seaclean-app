/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Vercel to ignore type errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // This tells Vercel to ignore linting errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;