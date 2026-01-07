import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    middlewareClientMaxBodySize: "25mb",
  },
  images: {
  remotePatterns: [
    { protocol: "https", hostname: "lnwltmhmqjnzrnbjtcce.supabase.co" },
  ],
},
};

export default nextConfig;
