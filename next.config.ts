import type { NextConfig } from "next";
import path from "path";


const nextConfig: NextConfig = {
  // Allow images from external domains if needed in the future
  images: {
    remotePatterns: [],
  },

  // Suppress workspace root detection warning caused by multiple lockfiles
  turbopack: {
    root: path.resolve('.'),
  },
};

export default nextConfig;
