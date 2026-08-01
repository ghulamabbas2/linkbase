# Data Mutations

How Linkbase writes data. Every mutation is a Server Action and follows the same ordered steps.

## All writes go through Server Actions

**Writes are Server Actions, never API routes.** `app/api` Route Handlers are reserved for webhooks and third-party callbacks (see [routing.md](./routing.md)); the app's own creates, updates, and deletes are Server Actions.

## The mutation sequence

Every action performs these steps, in order:

1. **Check the session first.** Resolve the signed-in user's id from the auth helper (`lib/auth`). If there is no session, stop here — identity is enforced on the server, never taken from client input (see [auth.md](./auth.md)).
2. **Validate input with the matching Zod schema** from `lib/validation`. On a validation failure, return the typed error (see below) — do not proceed.
3. **Scope the query to the signed-in user's id.** Every write filter includes `userId`; on create, set `userId` from the session, never from the payload (see [database.md](./database.md)).
4. **Perform the write.**
5. **Revalidate affected views** with `revalidatePath` or `revalidateTag` so the UI reflects the change (see [data-fetching.md](./data-fetching.md) for how reads are cached and tagged).

## Return a typed result — don't throw for expected failures

Actions **return a typed result** with either the data or a validation error. Expected failures (invalid input, not found) are **returned, not thrown** — only unexpected errors throw and bubble to the nearest `error.tsx` (see [errors-and-validation.md](./errors-and-validation.md)).

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string[]> };
```

```ts
// lib/actions/create-link.ts (shape)
"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { Link } from "@/lib/db/models/link";
import { createLinkSchema } from "@/lib/validation/link";

export async function createLink(input: unknown): Promise<ActionResult<LinkDTO>> {
  // 1. session
  const userId = await requireUserId();

  // 2. validation
  const parsed = createLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // 3. scope + 4. write
  await connectToDatabase();
  const link = await Link.create({ ...parsed.data, userId });

  // 5. revalidate
  revalidatePath("/dashboard");

  return { ok: true, data: toLinkDTO(link) };
}
```
