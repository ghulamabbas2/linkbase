# Coding Standards

Conventions for writing code in Linkbase. These are enforced by tooling where possible and by convention otherwise.

## Language

- **TypeScript with strict mode on.** `strict: true` in `tsconfig.json` — all strict checks apply.
- **No `any`.** Use a real type, `unknown` with narrowing, or a generic. If a type is genuinely unknowable, reach for `unknown` and narrow it, not `any`.
- **No `@ts-ignore` / `@ts-expect-error` without a comment** on the line above explaining why the suppression is necessary.

## Formatting & linting

- **Prettier** owns formatting. Do not hand-format; run Prettier and match its output.
- **ESLint** with the **Next.js config** owns linting. Code must pass `npm run lint` with no errors.

## Imports

Order imports in three groups, separated by a blank line:

1. **External packages** (e.g. `react`, `next`, `mongoose`).
2. **Internal aliases** (`@/lib`, `@/components`, and other `@/*` paths).
3. **Relative imports** (`./`, `../`).

```ts
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/connect";
import { Button } from "@/components/ui/button";

import { formatHandle } from "./utils";
```

## Components

- **Function declarations with typed props**, not arrow-function consts:

  ```tsx
  interface UserCardProps {
    handle: string;
  }

  export function UserCard({ handle }: UserCardProps) {
    // ...
  }
  ```

- **No default exports** — use named exports. The **only exception is Next.js route files** (`page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts`, etc.), which require a default export by convention.

## Async & errors

- **Async work uses `async`/`await`.** Never `.then()` chains.
- **Throw real `Error` objects**, never strings:

  ```ts
  // Correct
  throw new Error("Link not found");

  // Wrong
  throw "Link not found";
  ```
