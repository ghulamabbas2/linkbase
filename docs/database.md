# Database

Linkbase uses **MongoDB** with **Mongoose**. Mongoose owns the schema definitions, validation, and connection pooling.

## Connection

The connection helper lives in `lib/db` and exports a single async function that returns a connected Mongoose instance.

- **A single cached connection is reused** across Server Actions in both development and production. Server Actions run in a long-lived Node runtime, and repeatedly calling `mongoose.connect()` would exhaust the connection pool — so the connection (and its in-flight promise) is cached on the Node.js `global` object and reused on every call.
- The cache stores both the resolved connection and the pending promise, so concurrent callers during cold start await the same connect instead of opening duplicates.
- Every Server Action and every data-access function calls the connection helper first, before running a query. It is a no-op once the connection is established.

```ts
// lib/db/connect.ts (shape)
import mongoose from "mongoose";

const cached = (global as any).mongoose ?? { conn: null, promise: null };
(global as any).mongoose = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

## Models

Models live in `lib/db/models`, one file per model (kebab-case, e.g. `link.ts`, `profile.ts`).

Because modules are cached, guard model registration so a model is only compiled once across hot reloads:

```ts
export const Link = mongoose.models.Link ?? mongoose.model("Link", linkSchema);
```

### Schema conventions

Every schema is configured with:

- **Strict mode** (`strict: true`, the Mongoose default) — fields not in the schema are dropped rather than silently persisted.
- **Timestamps** (`{ timestamps: true }`) — automatic `createdAt` / `updatedAt`.
- **Indexes** on `userId` and `handle` — `userId` scopes every read (see below), and `handle` supports lookups by handle. Declare them on the schema (e.g. `schema.index({ userId: 1 })`, `schema.index({ handle: 1 })`).

## User scoping — every query is scoped to `userId`

**Every query is scoped to the signed-in user's id.** A user can only ever read or mutate their own data.

- Resolve the signed-in user's id from the auth helper (see `lib/auth`) at the start of each Server Action.
- Include `userId` in the filter of every `find`, `findOne`, `updateOne`, `deleteOne`, etc. Never query by document `_id` or `handle` alone — always combine it with `userId`:

```ts
// Correct: scoped to the owner
await Link.findOne({ _id: id, userId });
await Link.find({ userId });

// Wrong: leaks other users' data
await Link.findOne({ _id: id });
```

- On create, set `userId` from the authenticated session, never from client input.

This scoping is the primary authorization boundary for data access — treat it as mandatory, not optional.
