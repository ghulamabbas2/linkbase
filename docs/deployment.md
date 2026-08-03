# Deployment

How Linkbase ships. Every change reaches an environment through a **GitHub Actions CI/CD pipeline that deploys to Vercel**, with the build run inside **Docker** so CI, previews, and production compile against the exact same toolchain. Nothing deploys by hand, and nothing deploys without the checks below passing first.

## Why Docker

The build runs in a pinned container image, not on whatever the runner happens to provide. This keeps the environment identical everywhere:

- **Pinned Node.js and package manager.** The image fixes the Node major version and lockfile install, so a green build on a laptop, in CI, and on Vercel means the same thing.
- **Reproducible installs.** Dependencies come from `package-lock.json` via `npm ci` — never `npm install` — so no drift between runs.
- **One source of truth.** The `Dockerfile`'s `builder` stage runs the whole quality gate — lint, typecheck, tests, *and* a full production build — so "it builds" is proven in a clean, pinned environment before anything deploys.
- **A runnable production image.** The `Dockerfile`'s `runner` stage packages Next's `standalone` output as a lean, non-root image. `docker compose up --build` runs it against a local MongoDB for production-parity smoke tests, and it is what you would self-host if you ever left Vercel.

Docker is the reproducible **build/verify** environment; Vercel performs the actual optimized deploy. The `builder` stage is the gate — Docker proves *what* builds, Vercel decides *where* it runs.

## The two flows

There are exactly two deployment paths, mapped to the branch model in [git-conventions.md](./git-conventions.md). Both reuse one gate — `.github/workflows/quality.yml` (a `workflow_call` that builds the Docker `builder` stage) — and then deploy with the Vercel CLI's prebuilt flow so source is never uploaded to Vercel's builders.

### Feature branches → Preview

Workflow: `.github/workflows/preview.yml`, triggered `on: pull_request`.

1. The quality gate runs the full check suite (see [Checks](#checks-before-any-deploy)) inside Docker.
2. On green, the deploy job runs `vercel pull --environment=preview`, `vercel build`, then `vercel deploy --prebuilt` — an isolated, uniquely-URL'd **Preview** deployment for that PR.
3. The preview URL is posted back to the PR (a single sticky comment, updated in place) so reviewers can exercise the change live before approving.

Previews are per-PR and disposable. `concurrency` cancels superseded runs, so each push redeploys and closing the PR retires it. This is where human review (required before merge) actually happens.

### `main` → Production

Workflow: `.github/workflows/production.yml`, triggered `on: push` to `main`.

1. The same quality gate re-runs against the merged commit.
2. On green, the deploy job runs `vercel pull --environment=production`, `vercel build --prod`, then `vercel deploy --prebuilt --prod`, promoting that commit to the production domain. `concurrency` serializes production deploys and never cancels one in flight.

Because `main` is protected and only reachable through a reviewed PR, every production deploy corresponds to a reviewed, checked commit. There is no direct-to-`main` path and no manual production deploy.

## Checks before any deploy

The deploy step is gated on the quality job. If any check fails, **no deploy happens** — for previews *or* production. All checks run as ordered `RUN` steps in the Docker `builder` stage, so a failure fails the image build and blocks the deploy:

| Check | Command | Purpose |
| --- | --- | --- |
| Lint | `npm run lint` | ESLint (flat config) — style and correctness rules. |
| Typecheck | `npm run typecheck` | `tsc --noEmit` — full TypeScript check in strict mode, independent of the build. |
| Unit tests | `npx vitest run --passWithNoTests` | Vitest over pure functions and Zod schemas (see [testing.md](./testing.md)). |
| Build | `npm run build` | `next build` (standalone output) — the production compile must succeed. |

Rules of the gate:

- **The gate is blocking.** Deploy jobs declare `needs:` the check job; a red check stops the pipeline.
- **Branch protection enforces it on `main`.** The check job is a required status check, so a PR cannot merge with failing checks.
- **Unit tests only in CI.** End-to-end QA is MCP-driven and run separately per [testing.md](./testing.md) — it is not part of the automated deploy gate.

## Environment variables and secrets

Secrets never live in the repo — same rule as [security.md](./security.md). They are stored in two systems, each owning a different concern.

### Vercel — runtime secrets

Runtime values the app needs when it executes are set in **Vercel Project → Settings → Environment Variables**, scoped per environment:

| Variable | Preview | Production | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | Staging/preview Atlas DB | Production Atlas DB | Never share one cluster/DB across environments. |
| `AUTH_SECRET` | Preview value | Distinct production value | Generate per environment with `npx auth secret`. |

- **Scope each variable to the right environment.** Preview and Production get separate values; a preview deploy must never read production data or sign sessions with the production secret.
- **Server-only.** These are never exposed to the client and must not be prefixed `NEXT_PUBLIC_`.
- **`.env.example` stays the contract.** It lists every variable the app expects with placeholder values; Vercel's dashboard holds the real ones.

### GitHub — pipeline secrets

Credentials the *pipeline itself* needs live in **GitHub → Settings → Secrets and variables → Actions** (use Environments to gate the production ones behind approval):

- `VERCEL_TOKEN` — authenticates the Actions runner to deploy.
- `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — target the correct Vercel project.

These are deploy credentials, not app config — keep them out of Vercel's runtime env, and keep app secrets out of GitHub Actions.

## First-time setup

One-time wiring to make the pipeline live:

1. **Link the project and capture its IDs.** Run `npx vercel link` once locally; it writes `.vercel/project.json` (gitignored) containing `orgId` and `projectId`. Copy those into the GitHub secrets `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.
2. **Create a deploy token.** In Vercel → Account Settings → Tokens, create a token and store it as the `VERCEL_TOKEN` GitHub secret.
3. **Set runtime env vars in Vercel** for the Preview and Production environments (`MONGODB_URI`, `AUTH_SECRET`) as in the table above.
4. **Disable Vercel's native Git auto-deploy.** In Vercel → Project → Settings → Git, turn off automatic deployments. Deploys are driven exclusively by these workflows, so leaving Git integration on would double-deploy every push.
5. **Match the Node version.** Set the Vercel project's Node.js version to the major in [`.nvmrc`](../.nvmrc) (`22`) so Vercel builds on the same runtime the Docker gate uses.
6. **Protect `main`.** Require the `quality` check to pass and require a PR review before merge (see [git-conventions.md](./git-conventions.md)).

The GitHub `preview` and `production` [Environments](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment) referenced by the workflows can additionally gate the production deploy behind a required reviewer.

## MongoDB Atlas (production)

Production connects to a dedicated **MongoDB Atlas** cluster via `MONGODB_URI`, set in Vercel's Production environment:

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/linkbase?retryWrites=true&w=majority
```

Configured for reliability and least privilege:

- **Dedicated production database.** Separate cluster/database from preview and from the `MONGODB_URI_TEST` database used by QA — no environment shares data.
- **Scoped database user.** The connection user has access only to the `linkbase` database with the minimum required role, not cluster admin.
- **Network access.** Atlas is locked to the deployment's egress rather than left open to `0.0.0.0/0`; the credentialed connection string is the only way in.
- **`retryWrites=true`** so transient primary failovers retry transparently, keeping writes durable across Atlas maintenance.
- **Rotatable.** The URI is a Vercel secret, so rotating the Atlas password is a dashboard change plus a redeploy — no code change.

## Reliability & security summary

- **Reproducible builds** — Docker + `npm ci` from the lockfile means every environment builds identically.
- **Gated deploys** — lint, typecheck, tests, and build must pass before any preview or production deploy.
- **Reviewed production** — `main` is protected; production only ships reviewed, checked commits, never a manual push.
- **Isolated previews** — every PR gets its own live URL and its own preview environment/data.
- **Secrets stay out of git** — runtime config in Vercel, deploy credentials in GitHub Actions, each scoped per environment.
- **Environment isolation** — separate Atlas databases and separate `AUTH_SECRET`s for preview, production, and test.
