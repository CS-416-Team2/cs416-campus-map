import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "www.pnw.edu" },
      { protocol: "https", hostname: "pnw.edu" },
    ],
  },
  transpilePackages: ["react-map-gl", "mapbox-gl"],
};

export default nextConfig;
