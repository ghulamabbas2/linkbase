import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a minimal, self-contained server build (.next/standalone) so the
  // production Docker image ships only the runtime files it needs.
  // See node_modules/next/dist/docs/01-app/02-guides/self-hosting.md
  output: "standalone",
  // Pin the file-tracing root to this project so `.next/standalone` always
  // lays out `server.js` at its top level. Without this, a stray lockfile in a
  // parent directory can make Next infer the wrong root and nest the output.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
