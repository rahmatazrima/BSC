import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable image optimization globally to prevent 500 errors
    unoptimized: true,
  },
};

export default nextConfig;
