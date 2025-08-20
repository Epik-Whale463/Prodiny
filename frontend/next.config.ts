import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations - use standalone for dynamic routes
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  
  // Environment-specific API URL
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Ignore ESLint errors during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignore TypeScript errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
