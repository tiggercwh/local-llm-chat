import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/shared-layout" },
      { source: "/chat/:path*", destination: "/shared-layout/chat/:path*" },
    ];
  },
};
export default nextConfig;
