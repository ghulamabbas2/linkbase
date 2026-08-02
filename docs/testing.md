# Testing

How Linkbase is tested. There are two layers — fast unit tests for pure logic, and MCP-driven end-to-end QA for real user flows — and they never overlap.

## Unit tests — Vitest

**Vitest** covers **pure functions and Zod schemas**: the logic you can exercise without a browser, a session, or a database.

- Tests live **next to the file they test**, named `*.test.ts` (e.g. `lib/validation/link.ts` → `lib/validation/link.test.ts`).
- Scope is **pure logic only** — transforms, formatters, and Zod schema parsing (valid input passes, invalid input fails with the expected field errors). No database, no network, no rendering.

## End-to-end QA — Playwright MCP

Real user flows are exercised through **Playwright driven by MCP**, orchestrated by the **`run-qa-suite` skill**. This is how Server Actions and full flows are verified — through the running app, not in isolation.

- **No `/e2e` folder, no `playwright.config.ts`, no committed `.spec.ts` files.** QA is driven live through the MCP skill, not from checked-in Playwright test files.
- **Server Actions are tested through MCP-driven QA, not mocked.** They run for real against the app and the test database.

## Test database

QA runs against a **separate test database**, configured via **`MONGODB_URI_TEST` in `.env.test`**. It **never** touches the dev or prod database.

## Independence

**Every test is independent.** No shared state, no test-order dependencies — each test sets up what it needs and stands on its own, so tests can run in any order or in isolation.
