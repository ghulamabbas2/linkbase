# syntax=docker/dockerfile:1

# Multi-stage build for the Linkbase Next.js app.
#
# - `deps`    installs dependencies from the lockfile (reproducible).
# - `builder` runs the full quality gate (lint, typecheck, tests) and then
#             produces the standalone production build. In CI we build this
#             stage (`--target builder`); if any check fails the build fails.
# - `runner`  is the lean, non-root production runtime image.
#
# Node version is pinned (also see .nvmrc) so CI, containers, and Vercel all
# compile against the same toolchain.

ARG NODE_VERSION=22-alpine

# ---- Base -------------------------------------------------------------------
FROM node:${NODE_VERSION} AS base
# libc6-compat helps some native addons run on Alpine's musl libc.
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Dependencies -----------------------------------------------------------
FROM base AS deps
# Copy only manifests first so this layer is cached unless deps change.
COPY package.json package-lock.json ./
RUN npm ci

# ---- Builder: quality gate + production build -------------------------------
FROM base AS builder
ENV NODE_ENV=production

# Placeholders only. Real secrets are injected at runtime (Vercel / compose),
# never baked into the image. These keep `next build` from failing if any
# module reads them at import time; they are NOT copied into `runner`.
ARG AUTH_SECRET="build-time-placeholder-not-a-real-secret"
ARG MONGODB_URI="mongodb://placeholder:27017/linkbase-build"
ENV AUTH_SECRET=${AUTH_SECRET}
ENV MONGODB_URI=${MONGODB_URI}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Quality gate — ordered fastest-to-slowest. A failure here fails the image
# build, which blocks the deploy in CI.
RUN npm run lint \
  && npm run typecheck \
  && npx vitest run --passWithNoTests \
  && npm run build

# ---- Runner: production runtime ---------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Public assets and the standalone server + its traced node_modules.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Liveness probe: healthy as long as the server answers HTTP at all (any
# status), so a transient downstream error doesn't flap the container.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(()=>process.exit(0)).catch(()=>process.exit(1))"

# server.js is emitted by Next's standalone output.
CMD ["node", "server.js"]
