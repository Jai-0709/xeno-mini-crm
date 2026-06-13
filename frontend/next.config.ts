import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/about', destination: '/about.html' },
      { source: '/features', destination: '/features.html' },
    ];
  },
};

export default nextConfig;
