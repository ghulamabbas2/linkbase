# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: read the bundled docs first

This project pins a specific Next.js version (`next@16.2.12`, React 19) that may differ from your training data. Before writing any Next.js code, consult the version-exact docs bundled in the installed package:

- `node_modules/next/dist/docs/index.md` — entry point
- `node_modules/next/dist/docs/01-app/` — App Router (getting-started, guides, api-reference, glossary)
- `node_modules/next/dist/docs/02-pages/`, `03-architecture/`

Heed deprecation notices in those docs. Do not assume APIs, conventions, or file structure from memory.

## Commands

```bash
npm run dev     # start dev server at http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint (flat config)
```

There is no test setup in this project yet.

## Architecture

Next.js **App Router** project. All application code lives under `app/`:

- `app/layout.tsx` — root layout; loads Geist fonts via `next/font/google` and exposes them as the `--font-geist-sans` / `--font-geist-mono` CSS variables.
- `app/page.tsx` — the `/` route.
- `app/globals.css` — global styles.

Styling is **Tailwind CSS v4**, configured entirely in CSS (no `tailwind.config.js`). `app/globals.css` uses `@import "tailwindcss"` and an `@theme inline` block to map CSS variables (background/foreground colors, fonts) into Tailwind's theme. Dark mode is driven by `prefers-color-scheme`. PostCSS wires this up via `@tailwindcss/postcss` in `postcss.config.mjs`.

TypeScript path alias: `@/*` maps to the repo root (see `tsconfig.json`).

## Doc Convention

Whenever a new file is created in `/docs`, add it to the **Project Docs** section below with one line on what it covers and when to read it.

### Project Docs

- `docs/design-system.md` — design tokens (fonts, colors, spacing, radii) mapped to CSS variables and their Next.js/Tailwind usage. Read before styling anything or touching theme values.
- `docs/ui.md` — component reference (buttons, inputs, etc.) with props, variants, and states from the design system source. Read before building or modifying UI components.
- `docs/architecture.md` — directory layout, the Server/Client Component model, and file/component/Server Action naming conventions. Read before adding files or deciding where code belongs.
- `docs/database.md` — MongoDB/Mongoose setup: cached connection helper, model conventions (strict mode, timestamps, `userId`/`handle` indexes), and mandatory per-user query scoping. Read before writing any data-access code or Server Action that touches the database.
- `docs/auth.md` — NextAuth setup: route protection (protected `(dashboard)` routes via middleware, public `/user/[handle]`), and server-side identity enforcement in Server Actions and through `userId` ownership checks. Read before touching auth, middleware, or any protected route or Server Action.
- `docs/coding-standards.md` — TypeScript/formatting conventions: strict mode, Prettier + Next.js ESLint config, import ordering, component style (typed function declarations, no default exports outside route files), and async/error rules. Read before writing or refactoring any code.
- `docs/routing.md` — route map and App Router conventions: public routes, the `(dashboard)` (middleware-protected) and `(auth)` route groups, per-route `layout`/`loading`/`error` files, and the rule that `app/api` Route Handlers are for webhooks/callbacks only while everything else uses Server Actions. Read before adding routes or API handlers.
- `docs/errors-and-validation.md` — Zod validation at the Server Action boundary (shared schemas in `lib/validation`), the typed-result pattern for field-level validation errors vs. thrown unexpected errors caught by `error.tsx`, and the rule never to leak raw messages/stack traces to the client. Read before writing Server Actions, forms, or error handling.
- `docs/data-fetching.md` — read patterns: query the database directly in Server Components (no internal API fetches), scope to `userId` for private data and `handle` for public profiles, cache with the `fetch` cache / `unstable_cache` tagged for `revalidateTag`, and pass data to Client Components as props. Read before writing any read path or caching.
- `docs/data-mutations.md` — write patterns: the ordered Server Action sequence (check session → validate with Zod → scope to `userId` → write → `revalidatePath`/`revalidateTag`) and the typed-result return that returns validation errors instead of throwing. Read before writing any Server Action that mutates data.
