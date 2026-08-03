# Deployment

How Linkbase ships to production. The app is hosted on **Vercel** and deployed through a **GitHub Actions CI/CD pipeline**, with a **Dockerized build** so the environment that validates and builds a change is identical everywhere — locally, in CI, and for every branch. Nothing reaches production except through this pipeline; there are no manual deploys.

## Repository files

| File | Purpose |
| --- | --- |
| `Dockerfile` | Multi-stage build: `deps` → `builder` → `ci` (reproduce all checks locally) → `runner` (minimal non-root runtime image, standalone output). |
| `.dockerignore` | Keeps the build context small and secret-free (`node_modules`, `.env*`, `.git`, etc.). |
| `next.config.ts` | `output: "standalone"` + pinned `outputFileTracingRoot` for the Docker image, plus baseline security headers. |
| `.github/workflows/preview.yml` | PR → `lint`/`typecheck`/`test`/`docker-build` jobs → **Vercel Preview**, comments the URL on the PR. |
| `.github/workflows/production.yml` | Push to `main` → same check jobs → **Vercel Production**. |

## Principles

- **Every deploy is gated by checks.** Lint, typecheck, and tests must pass before a build is even attempted. A red check blocks the deploy — no overrides.
- **The build environment is reproducible.** The same Docker image (pinned Node version, pinned `next@16.2.12`) runs in CI and produces every build, so "works on my machine" never decides what ships.
- **Secrets never live in the repo.** They are stored in GitHub (for CI) and Vercel (for runtime), and injected at build/run time — consistent with [security.md](./security.md).
- **`main` is always deployable.** Work reaches `main` only through a reviewed PR (see [git-conventions.md](./git-conventions.md)); merging to `main` is what triggers a production deploy.

## Two deployment flows

### 1. Feature branches → Vercel Preview

When a pull request is opened (or updated) from a `feat/*` / `fix/*` branch, the pipeline:

1. Runs the **check jobs** in parallel — `lint`, `typecheck`, `test`, and `docker-build` (which builds the production image).
2. On green, the `deploy-preview` job builds and deploys a **Preview build** to Vercel with a unique, isolated preview URL.
3. Posts the preview URL back on the PR so reviewers can test the change **in isolation** — its own deployment, its own environment variables — without affecting production or other branches.

Every push to the PR redeploys the preview, so the URL always reflects the latest commit. Preview deployments use the **Preview** environment's variables in Vercel (see below), never production secrets.

### 2. `main` → Vercel Production

When a PR is **merged into `main`**, the pipeline:

1. Runs the same **check jobs** (`lint`, `typecheck`, `test`, `docker-build`) against the merged result.
2. On green, the `deploy-production` job deploys to **Vercel Production**, promoting the build to the production domain.

Because `main` only advances through reviewed, check-passing PRs, production deploys are the byproduct of a merge — not a separate manual step.

## Required checks (must pass before any deploy)

Each runs as its **own GitHub Actions job** (on the runner, via `actions/setup-node` with npm caching) so its status shows separately on the PR. The `deploy` job declares `needs: [lint, typecheck, test, docker-build]`, so if any one is red the deploy job never starts.

| Job | Command | Catches |
| --- | --- | --- |
| **Lint** | `npm run lint` | Style and correctness issues (Next.js ESLint flat config) |
| **Typecheck** | `npm run typecheck` (`tsc --noEmit`) | Type errors across the strict TypeScript project |
| **Test** | `npm run test` (`vitest run`) | Broken pure logic and Zod schemas — see [testing.md](./testing.md) |
| **Docker image build** | `docker build .` | The production image / in-image `next build` breaking |

End-to-end QA (Playwright MCP via the `run-qa-suite` skill) is **not** part of the automated pipeline — it is run locally against the test database, as described in [testing.md](./testing.md). Preview deployments are the place to exercise a change end-to-end after CI passes.

## Dockerized build

The `Dockerfile` is a multi-stage build (`deps` → `builder` → `ci` → `runner`). The `docker-build` CI job builds the **runtime image** to keep it green; the checks themselves run as separate runner jobs (above), and the `ci` stage exists so you can reproduce all checks in one pinned image locally with `docker build --target ci .`.

- **Pinned base image** — a fixed Node LTS version matching local development, so the toolchain never drifts.
- **Pinned dependencies** — installed from `package-lock.json` with `npm ci` (exact, reproducible installs), and `next@16.2.12` pinned in `package.json`.
- **`.dockerignore`** excludes `node_modules`, `.env*`, and local artifacts so secrets and machine-specific files never enter the image.
- **Standalone runtime** — the `runner` stage runs Next.js standalone output as a non-root user with a healthcheck; build-time env placeholders are passed inline to `next build` only and never reach the runtime image.

## Environment variables and secrets

Secrets are split by where they are needed, and never committed. `.env.example` remains the checked-in template listing every variable the app expects (see [security.md](./security.md)).

### In GitHub (CI)

- Stored as **GitHub Actions Secrets** (repository or environment scoped).
- Used by the pipeline to authenticate to Vercel and to run checks. The workflows require exactly three repository secrets:
  - **`VERCEL_TOKEN`** — a Vercel access token (Account Settings → Tokens), scoped to the project's team.
  - **`VERCEL_ORG_ID`** and **`VERCEL_PROJECT_ID`** — from `.vercel/project.json` after running `vercel link` once locally.
- Exposed to jobs only through the Actions secrets mechanism — never printed to logs.

### First-time Vercel setup

1. `npm i -g vercel && vercel link` in the repo to create `.vercel/project.json` (gitignored) — copy its `orgId`/`projectId` into the GitHub secrets above.
2. Create the `VERCEL_TOKEN` and add all three secrets under **GitHub → Settings → Secrets and variables → Actions**.
3. In the Vercel project, set `MONGODB_URI` and `AUTH_SECRET` for the **Production** and **Preview** environments (distinct values each).
4. Optional but recommended: add a GitHub **Environment** named `production` (the production workflow references it) with required reviewers for a manual approval gate before production deploys.

### In Vercel (runtime)

Runtime variables are configured per **environment** in the Vercel project settings, so preview and production stay isolated:

- **Production** — the live values used by production deploys.
- **Preview** — non-production values used by every PR preview build.
- **Development** — values for `vercel dev` / local pulls.

Core variables (from `.env.example`):

- **`MONGODB_URI`** — the database connection string, set **separately per environment** (see below).
- **`AUTH_SECRET`** — the NextAuth signing/encryption secret. Generate a **distinct** value per environment with `npx auth secret`; never share the production secret with preview.

Server-only values are **never** prefixed `NEXT_PUBLIC_`, so they stay out of the client bundle.

> **Self-hosting the Docker image** (not Vercel): the `runner` stage sets `AUTH_TRUST_HOST=true` so Auth.js trusts the proxied Host header. Provide `MONGODB_URI` and `AUTH_SECRET` at `docker run` time (e.g. `--env-file`), never baked into the image. On Vercel `AUTH_TRUST_HOST` is unnecessary.

### MongoDB Atlas (production database)

- Production uses a **MongoDB Atlas** cluster; its `mongodb+srv://…` connection string is stored as the **Production** `MONGODB_URI` in Vercel — nowhere else.
- **Preview deployments point at a separate, non-production database**, so preview traffic can never read or write production data. This is a different value than the `MONGODB_URI_TEST` used by local QA ([testing.md](./testing.md)); keep the three databases (production, preview, test) distinct.
- **Network access:** Atlas is locked down by IP allowlist. Because Vercel's serverless functions use dynamic egress IPs, either enable an Atlas access-list entry for Vercel's ranges or use **Atlas Private Endpoint / VPC peering** where available. Prefer scoping over opening `0.0.0.0/0`.
- **Least-privilege credentials:** the production DB user has only the permissions the app needs (read/write to the app database), not cluster-admin. Rotate credentials periodically and on any suspected exposure.

## Reliability and security practices

- **Fail closed.** A failing check or a missing required secret aborts the deploy rather than shipping a degraded build.
- **Isolated environments.** Preview and production never share secrets or databases, so testing a branch cannot touch live data.
- **Reproducible builds.** Pinned image + `npm ci` + pinned `next` version mean a build can be reproduced byte-for-byte to diagnose failures.
- **Instant rollback.** Vercel keeps prior production deployments; if a release regresses, promote the last known-good deployment to roll back immediately while a fix goes through the normal PR flow.
- **Least privilege everywhere.** The `VERCEL_TOKEN` and Atlas DB user carry only the scope they need; secrets are environment-scoped, not global.
- **No secrets in logs or images.** `.dockerignore` keeps `.env*` out of the image, and CI never echoes secret values.
