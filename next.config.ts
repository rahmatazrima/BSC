import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable image optimization globally to prevent 500 errors
    unoptimized: true,
  },
  // PWA Configuration
  // Service worker akan di-copy ke public folder saat build
  // Pastikan sw.js sudah ada di public/sw.js
};

export default nextConfig;
