---
name: create-feature
description: Build an approved feature by writing code that follows the /docs conventions. Use right after a plan is approved — whenever the user starts building, implementing, or coding a feature that has already been planned and approved. Writes code only; does not write tests, run QA, or commit.
---

# Create Feature

Run this **after a plan has been approved** (typically the output of `plan-feature`). It implements the feature by writing code that follows the approved plan and the project conventions in `/docs`. It is the build step only.

**This skill writes code only. It does NOT write tests, does NOT run QA, and does NOT commit.** Those are separate, user-triggered steps (`write-tests`, `run-qa-suite`). Do not start them — the user will trigger them explicitly.

## Steps

### 1. Load the approved plan

- Get the branch name: `git branch --show-current`.
- Read the persisted plan at `./plans/<current-branch>.md`. If it is missing, ask the user for the approved plan before writing any code — do not improvise a feature that was never planned.

The plan is the source of truth for what to build: the files to create/change, data/validation, and QA scenarios.

### 2. Read the relevant docs first

Before writing code, read the doc files the plan cites, plus the always-relevant ones:

- `docs/architecture.md` — where files belong, Server/Client Component split, naming conventions.
- `docs/coding-standards.md` — TypeScript/formatting, imports, component style, async/error rules.
- `docs/database.md` — if the feature touches data (models, queries, mandatory `userId` scoping).
- `docs/data-mutations.md` / `docs/data-fetching.md` — the ordered Server Action sequence and read/caching patterns.
- `docs/errors-and-validation.md` — Zod schemas at the Server Action boundary and the typed-result pattern.
- `docs/auth.md` — anything behind `(dashboard)` or touching identity/ownership.
- `docs/routing.md` — new routes, route groups, Route Handlers.
- `docs/security.md` — secrets, headers, rate limiting, user-generated content.
- `docs/ui.md` / `docs/design-system.md` — new or changed UI.

Read the docs that match the plan's scope; do not skip a doc the plan cites.

### 3. Pull live library docs through Context7

This project pins `next@16.2.12` (React 19) and its APIs may differ from training data. Before writing code that uses Next.js, Mongoose, NextAuth, Zod, or any other third-party library:

- Consult the version-exact Next.js docs bundled in `node_modules/next/dist/docs/` (start at `index.md`, App Router under `01-app/`). Heed deprecation notices.
- Resolve the library through Context7 and fetch its current docs, then write code against what those docs say. If Context7 has no entry for a library, say so explicitly before falling back to training-data knowledge.

Do not assume APIs, config, or file structure from memory.

### 4. Build the feature

Implement the plan file by file, following the conventions:

- Match the plan's list of files to create/change. If you discover the plan needs to deviate (a missing file, a wrong path), note it and follow the docs.
- Scope every private query and mutation to `userId`; validate input with the shared Zod schemas; follow the ordered Server Action sequence (session → validate → scope → write → revalidate) and the typed-result return.
- Keep code consistent with the surrounding code's style, naming, and idioms.
- Write **code only** — no test files, no QA scripts.

### 5. Stop and hand back

When the build is done:

- **Do not** write tests, run QA, run the test suite, or commit.
- Report what was built in **2–3 lines** — the feature and the key files created/changed.
- Hand back and stop. Tell the user that `write-tests` and `run-qa-suite` are ready to run when they are.
