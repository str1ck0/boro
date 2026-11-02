import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Almost every page is personalised (session, saved items, unread counts), so
  // we render dynamically rather than opting into Cache Components for now.
  cacheComponents: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
