import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "30mb",
  },
  images: {
  remotePatterns: [
    { protocol: "https", hostname: "lnwltmhmqjnzrnbjtcce.supabase.co" },
    { protocol: "https", hostname: "*.cdninstagram.com" },
    { protocol: "https", hostname: "*.fbcdn.net" },
  ],
},
};

export default nextConfig;
