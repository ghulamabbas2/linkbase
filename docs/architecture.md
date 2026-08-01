# Architecture

How the Linkbase codebase is organized and the conventions to follow when adding to it.

## Rendering model

This is a Next.js **App Router** project. The defaults follow the App Router grain:

- **Server Components are the default.** Every component is a Server Component unless it needs interactivity.
- **Client Components only where interactivity is needed** — state, effects, event handlers, or browser-only APIs. Mark these with the `"use client"` directive and keep them as small as possible, pushing the boundary as far down the tree as you can so most of the UI stays on the server.

## Directory layout

```
app/                    App Router routes, layouts, and Server Actions
components/
  ui/                   Reusable UI primitives (buttons, inputs, etc.)
  [feature]/            Feature-specific components grouped by feature
lib/
  db/                   Database client
  auth/                 Auth helpers
  types/                Shared TypeScript types
docs/                   Project documentation
```

### `app/`

Routes, layouts, and Server Actions live here, following App Router file conventions (`page.tsx`, `layout.tsx`, `route.ts`, etc.).

### `components/`

- `components/ui/` — shared, presentation-only UI primitives that are not tied to any one feature.
- `components/[feature]/` — components scoped to a specific feature. Group by feature rather than by component type.

### `lib/`

Shared, non-UI code. Each concern lives in its own folder:

- `lib/db/` — the database client.
- `lib/auth/` — auth helpers.
- `lib/types/` — shared TypeScript types.

## Naming conventions

- **Files:** `kebab-case` (e.g. `user-card.tsx`, `create-link.ts`).
- **Components:** `PascalCase` (e.g. `UserCard`) — the export, even though the file is kebab-case.
- **Server Actions:** verb-first (e.g. `createLink`, `deleteLink`, `updateProfile`).
