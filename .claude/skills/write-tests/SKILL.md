---
name: write-tests
description: Write unit tests for a feature following the conventions in docs/testing.md. Use whenever the user asks to write or add tests for a feature, function, or Zod schema. Reads docs/testing.md first, then writes unit tests in the places and style that doc defines. Writes tests only; does not run them, does not run QA, does not commit.
---

# Write Tests

Write the unit tests for a feature, following the project's testing conventions. This is the test-writing step only.

**This skill writes tests only. It does NOT run tests, does NOT run QA, and does NOT commit.** Those are separate, user-triggered steps (`run-qa-suite`, and the user's own commit flow). Do not start them — the user will trigger them explicitly.

## Steps

### 1. Read the testing conventions first

Read `docs/testing.md` before writing anything. It is the source of truth for **what to test, where the tests live, and how they are named/styled**. Do not improvise a testing approach from memory.

Key rules it defines (confirm against the doc, do not assume):

- **Vitest** covers **pure functions and Zod schemas** only — the unit layer.
- Tests live **next to the file they test**, named `*.test.ts` (e.g. `lib/validation/link.ts` → `lib/validation/link.test.ts`).
- End-to-end QA (Server Actions, full flows) is **not** in scope here — that is Playwright MCP via `run-qa-suite`. Do not write `.spec.ts` files, a `playwright.config.ts`, or an `/e2e` folder.

### 2. Identify what to test

Look at the feature's code and find the pure logic the doc says to cover:

- Pure functions — transforms, formatters, helpers with no database/network/rendering.
- Zod schemas — valid input parses, invalid input fails with the expected field errors.

Skip anything that requires a running app, session, or database — that belongs to MCP-driven QA, not unit tests.

### 3. Write the unit tests

For each unit under test, add a `*.test.ts` beside its source file:

- Match the style, naming, and idioms of any existing tests and the surrounding code.
- Keep **every test independent** — no shared state, no test-order dependencies. Each test sets up what it needs.
- Cover the meaningful cases: happy path plus the invalid/edge inputs that matter (for schemas, assert the specific field errors).

Write **tests only** — no source changes to make code testable unless the user asks, no QA scripts.

### 4. Stop and hand back

When the tests are written:

- **Do not** run the tests, run QA, or commit.
- Report what was added in **2–3 lines** — the test files created and what they cover.
- Hand back and stop.
