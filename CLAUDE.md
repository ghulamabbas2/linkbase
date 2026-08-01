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
