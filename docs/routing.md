# Routing

How Linkbase organizes routes under the App Router, and the conventions for adding new ones.

## Public routes

Reachable without an authenticated session:

- **`/`** — the landing page.
- **`/user/[handle]`** — the public profile, viewable by anyone.

## Authenticated routes — `(dashboard)` route group

Routes that require a signed-in user live under a **`(dashboard)`** route group:

- The **dashboard**, **add-links**, and other protected screens.
- **Middleware protects the whole group** — unauthenticated users are redirected to sign-in before the route renders.

Route groups (parentheses) organize routes without adding a URL segment, so `(dashboard)` shapes the folder structure and shared layout without appearing in the path.

## Auth routes — `(auth)` route group

Sign-in and related authentication screens sit under an **`(auth)`** route group, kept separate from the protected `(dashboard)` group.

## Per-route files

Each route owns its own **`layout.tsx`**, **`loading.tsx`**, and **`error.tsx`** where needed, following App Router file conventions. Add them at the level that needs them rather than pushing everything to the root.

## API vs. Server Actions

- **Route Handlers in `app/api` are reserved for webhooks and third-party callbacks only** — endpoints that external systems must call over HTTP.
- **Everything else goes through Server Actions.** Data reads and mutations from the app itself are Server Actions, not API routes.
