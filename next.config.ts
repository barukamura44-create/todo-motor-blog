import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from external domains if needed in the future
  images: {
    remotePatterns: [],
  },

  // Suppress workspace root detection warning caused by multiple lockfiles
  turbopack: {},
};

export default nextConfig;
