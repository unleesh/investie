import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel optimization settings
  experimental: {
    optimizePackageImports: ['@investie/types', '@investie/utils'],
  },
  
  // API routes configuration for external backend
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
    ]
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV,
  },
  
  // Build optimization
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
