import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Security headers applied to every route. See docs/security.md.
 * A strict Content-Security-Policy is intentionally left to a dedicated,
 * nonce-based setup and is not defined here to avoid breaking runtime.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Emit a self-contained server build (.next/standalone) for the Docker image.
  // Ignored by Vercel, which uses its own Build Output API.
  output: "standalone",

  // Pin the file-tracing root to this project so the standalone output is
  // rooted at the app (not a parent lockfile), keeping the Docker COPY paths
  // and `node server.js` stable across environments.
  outputFileTracingRoot: projectRoot,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
