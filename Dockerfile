# syntax=docker/dockerfile:1
# check=skip=SecretsUsedInArgOrEnv
# ^ AUTH_TRUST_HOST is non-sensitive Auth.js config (value is literally "true"),
#   but its name trips the secret heuristic. No real secrets are set via ENV/ARG
#   here — build-time placeholders are passed inline to `next build` only.

# ---------------------------------------------------------------------------
# Production-ready, multi-stage image for Linkbase (Next.js 16, standalone).
#
# Stages:
#   deps    - install exact dependencies from the lockfile
#   builder - produce the standalone production build
#   ci      - run lint + typecheck + tests (used as the CI gate, not shipped)
#   runner  - minimal, non-root runtime image
#
# Build the runtime image:   docker build -t linkbase .
# Run the CI checks:         docker build --target ci .
# ---------------------------------------------------------------------------

# Pinned Node LTS on a slim Debian base for a small, reproducible image.
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# `next build` (via @vercel/nft) and sharp benefit from these libs.
RUN apt-get update \
  && apt-get install -y --no-install-recommends libc6 \
  && rm -rf /var/lib/apt/lists/*

# --- Dependencies: cached unless package.json/lockfile change ---------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Build: compile the Next.js standalone output --------------------------
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholders are passed inline to `next build` only (not as persistent ENV, so
# no secret-looking metadata is baked into the image). They satisfy the
# import-time env guards (lib/db/connect.ts, Auth.js) so route modules can be
# evaluated. No DB connection is made at build — connect() is lazy — and these
# are not real secrets. Real values are injected when the container runs.
RUN MONGODB_URI="mongodb://placeholder:27017/build" \
    AUTH_SECRET="build-time-placeholder" \
    npm run build

# --- CI: run all required checks against the built image -------------------
# `docker build --target ci` fails the build if any check fails.
FROM builder AS ci
ENV NODE_ENV=development
RUN npm run lint \
  && npm run typecheck \
  && npm run test

# --- Runtime: minimal image running the standalone server ------------------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    # Auth.js (NextAuth v5) trusts the Host header when self-hosted behind a
    # trusted reverse proxy. Not needed on Vercel; required for this image.
    AUTH_TRUST_HOST=true

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output: server + only the traced node_modules it needs.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# Simple liveness check against the running server.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+ (process.env.PORT||3000) +'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
