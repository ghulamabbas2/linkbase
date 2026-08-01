# Data Fetching

How Linkbase reads data and where those reads live.

## Read in Server Components, straight from the database

- **Reads happen in Server Components by calling the database directly.** A Server Component awaits the data-access function (which awaits the DB) and renders with the result.
- **Never `fetch` an internal API route to read data.** There is no internal HTTP hop — the component queries the database directly. `app/api` Route Handlers are reserved for webhooks and third-party callbacks (see [routing.md](./routing.md)), not for the app's own reads.

## Query scoping

Every query is scoped to the identity that owns the data:

- **Private data** — scoped to the **signed-in user's id** (`userId`). This is the same mandatory per-user scoping described in [database.md](./database.md); resolve the id from the auth helper and include it in every filter.
- **Public profile pages** (`/user/[handle]`) — scoped to the **`handle`**. These are public and are not tied to a session, so they look up by handle rather than `userId`.

## Caching & revalidation

Cache reads where it measurably helps — don't cache reactively.

- Use the **Next.js `fetch` cache** for `fetch`-based reads, or **`unstable_cache`** to cache database queries and other non-`fetch` async functions.
- **Tag every cached entry** (`tags: [...]` on `unstable_cache`) so it can be invalidated on demand.
- After a mutation, **clear the affected tags with `revalidateTag`** from the Server Action that performed the write, so the next read sees fresh data.

```ts
// lib/db/queries.ts (shape)
import { unstable_cache } from "next/cache";

export const getPublicProfile = unstable_cache(
  async (handle: string) => {
    await connectToDatabase();
    return Profile.findOne({ handle });
  },
  ["public-profile"],
  { tags: ["profile"] },
);
```

```ts
// in the Server Action, after a successful write
revalidateTag("profile");
```

> **Version note (`next@16.2.12`).** This project's Next.js also ships the newer **Cache Components** model — the [`use cache`](../node_modules/next/dist/docs/01-app/api-reference/directives/use-cache.md) directive with `cacheTag`, plus `updateTag` for read-your-own-writes (immediate expiry) alongside `revalidateTag` (stale-while-revalidate). If you reach for caching, check the bundled docs (`node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` and `09-revalidating.md`) and prefer `updateTag` when a user must see their own mutation immediately. `unstable_cache` remains supported for projects not using Cache Components.

## Client Components never query the database

- **Client Components never touch the database directly.** They **receive data as props** from a Server Component that did the read.
- Keep the fetch on the server and pass the already-resolved, already-scoped data down. This keeps DB access, auth scoping, and secrets on the server and off the client.
