import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config: resolve .wasm and point to correct root
  turbopack: {
    resolveExtensions: [".wasm", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    root: process.cwd(),
  },

  // ── HTTP Headers ─────────────────────────────────────────────
  // Required for ffmpeg.wasm SharedArrayBuffer + Cross-Origin Isolation
  async headers() {
    return [
      // Entire app: cross-origin isolation headers
      {
        source: "/:path*",
        headers: [
          // Required for SharedArrayBuffer (ffmpeg.wasm multi-thread)
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // credentialless = enables SharedArrayBuffer without breaking
          // third-party CDN resources (fonts, images, etc.)
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
