# Auth

Linkbase uses **NextAuth** for authentication. It handles sign-in, session management, and the underlying security concerns (CSRF, session cookies, token handling) following industry best practices. Auth helpers live in `lib/auth`.

## Route protection

Access is deny-by-default for the authenticated area of the app:

- **Everything under `app/(dashboard)/*` is protected.** These routes require an authenticated session. **Middleware** enforces this, redirecting unauthenticated requests before the route renders.
- **The public profile at `/user/[handle]` stays open to everyone.** It is intentionally excluded from the protected set so profiles are viewable without signing in.

## Identity is enforced on the server

The session is never trusted from the client. Identity is enforced in two places on every write path:

- **In every Server Action.** Resolve the signed-in user's id from the auth helper (`lib/auth`) at the start of the action. Never take the acting user's identity from client input.
- **At the database level.** Ownership is enforced through `userId` checks on every query — a user can only read and write their own links. See [database.md](./database.md) for the mandatory per-user query scoping.

Together, middleware gates *who can reach* a route, and the per-Server-Action + per-query `userId` checks gate *what data they can touch* — so authorization does not depend on the UI hiding anything.
