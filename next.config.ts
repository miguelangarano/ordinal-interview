import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // TMDB's CDN already serves each image at the size we request (w185,
    // w342, …), so re-optimizing adds latency and burns the Vercel image
    // optimization quota for no gain.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
    ],
  },
};

export default nextConfig;
