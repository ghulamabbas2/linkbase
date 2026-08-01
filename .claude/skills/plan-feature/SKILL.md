---
name: plan-feature
description: Plan and scope a new feature before writing any code. Use at the start of every feature — whenever the user asks to plan, scope, design, or "figure out how to build" something new — to produce an approved technical plan (files to create/change, referenced against the /docs conventions) with QA scenarios, before implementation begins.
---

# Plan Feature

Run this at the **start of every new feature, before any code is written**. It produces a short technical plan, waits for explicit approval, and only then hands off to implementation. No code is written until the plan is approved.

## Steps

### 1. Enter Plan Mode

Call `EnterPlanMode` immediately. Do not edit, write, or run mutating commands while planning.

### 2. Read the relevant docs first

Ground the plan in project conventions. Always read:

- `docs/architecture.md` — where files belong, Server/Client Component split, naming conventions.
- `docs/database.md` — if the feature touches data (models, queries, `userId` scoping).

Then read the docs matching the feature area, e.g.:

- `docs/data-mutations.md` / `docs/data-fetching.md` — writes vs. reads and caching.
- `docs/errors-and-validation.md` — Zod schemas at the Server Action boundary.
- `docs/auth.md` — anything behind `(dashboard)` or touching identity/ownership.
- `docs/routing.md` — new routes, route groups, Route Handlers.
- `docs/security.md` — secrets, headers, rate limiting, user-generated content.
- `docs/ui.md` / `docs/design-system.md` — new or changed UI.

Also honor `CLAUDE.md`/`AGENTS.md`: this project pins `next@16.2.12` — consult the bundled docs in `node_modules/next/dist/docs/` and pull third-party library docs through Context7 before relying on memory.

### 3. Write the plan

Keep it short and concrete. Structure:

- **Goal** — one or two sentences on what the feature does.
- **Files to create / change** — a list, each entry naming the file and one line on its purpose. Cite the doc that governs it, e.g. `app/(dashboard)/links/actions.ts` — create-link Server Action (see `docs/data-mutations.md`, `docs/errors-and-validation.md`).
- **Data / validation** — models touched, Zod schemas, `userId` scoping (cite `docs/database.md`).
- **Open questions** — anything ambiguous the user should resolve.

The plan must stay consistent with the referenced docs. If a doc conflicts with the plan, follow the doc or flag it in Open questions.

### 4. QA Scenarios

End the plan with a **QA Scenarios** section: 3–6 concrete scenarios covering at minimum:

- **Happy path** — the feature working as intended.
- **Auth boundary** — unauthenticated/unauthorized access, or acting on another user's data.
- **Validation** — invalid or missing input.
- **Edge cases** — empty state, duplicates, limits, or other boundaries relevant to the feature.

One line each: what the user does → what should happen.

Example:
- Signed-in user submits a valid link → link is saved, scoped to their `userId`, list revalidates.
- Signed-out user POSTs to the create action → rejected, redirected to sign-in.
- User submits a malformed URL → field-level validation error returned, nothing written.

### 5. Wait for approval

Call `ExitPlanMode` to present the plan and **wait for explicit approval**. Do not write code until the user approves.

### 6. On approval, persist the plan

Once approved, before starting implementation:

1. Get the branch name: `git branch --show-current`.
2. Write the full approved plan to `./plans/<current-branch>.md` (create the `plans/` directory if needed; the branch name may contain `/`, so ensure parent dirs exist).

Then proceed with implementation against the approved plan.
