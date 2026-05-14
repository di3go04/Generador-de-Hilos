import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed Turbopack WASM config (ffmpeg moved to backend)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
  // Required for Stripe webhooks — raw body
  async headers() {
    return [
      {
        source: "/api/webhooks/:path*",
        headers: [{ key: "x-content-type-options", value: "nosniff" }],
      },
    ];
  },
  // Redirect old routes
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
