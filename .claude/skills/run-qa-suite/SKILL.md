---
name: run-qa-suite
description: Run end-to-end QA on the Linkbase app locally with Playwright MCP. Use whenever the user asks to run QA, run the QA suite, QA a feature, test the app, do end-to-end/e2e testing, verify a flow works in the running app, or check the happy path / auth boundary / validation / edge cases through the browser. Drives localhost:3000 against the scenarios in ./plans/<current-branch>.md, against the test database, fixing failures in code and re-running.
---

# Run QA Suite

Drive the running Linkbase app through its QA scenarios with Playwright MCP, fix any failures in code, and report a green summary. This is live end-to-end QA — Server Actions and full flows run for real against the **test** database, never mocked and never against dev/prod data. See `docs/testing.md`.

## 1. Load the scenarios

1. Get the current branch: `git branch --show-current`.
2. Read `./plans/<current-branch>.md` and extract the QA scenarios. These are the source of truth for what to test — they cover **happy path**, **auth boundary**, **validation**, and **edge cases**.
3. If the plan file is missing or has no QA scenarios, stop and tell the user — do not invent scenarios.

## 2. Point the app at the test database

QA must never touch the dev or prod database.

1. Confirm `.env.test` exists and defines the test connection string (`MONGODB_URI_TEST`, or `MONGODB_URI` pointing at the `*-test` database). If it's absent, stop and report — do not fall back to the dev database.
2. Start (or restart) the dev server with the test env loaded so `MONGODB_URI` resolves to the test database, e.g.:

   ```bash
   set -a && . ./.env.test && set +a && npm run dev
   ```

   Run it in the background and wait until `http://localhost:3000` responds. Verify the connection string in use is the test one before proceeding — if you cannot confirm the app is on the test DB, stop.
3. If a dev server is already running against the dev database, stop it and restart with the test env — otherwise QA would mutate real data.

## 3. Reset test database state between runs

Each scenario must stand on its own (see Independence in `docs/testing.md`).

- Before the suite, and **between scenario runs**, reset the test database to a clean state (drop/clear the collections the scenarios touch, then seed any required fixtures).
- Never assume state left by a previous scenario. Every scenario sets up what it needs.

## 4. Run the scenarios with Playwright MCP

Drive the app through the browser with the `mcp__playwright__*` tools at `http://localhost:3000`:

- Navigate, snapshot, fill forms, click, and assert on what actually renders.
- Cover every scenario category present in the plan: happy path, auth boundary (protected routes redirect unauthenticated users; users can't act on others' data), validation (invalid input shows field errors, valid input passes), and edge cases.
- Check both UI state and outcomes (e.g. the record was actually created/updated). Watch the console/network for errors.

## 5. On failure: diagnose, fix, re-run (max 3 attempts)

When a scenario fails:

1. Diagnose the root cause from the snapshot, console, network, and server logs.
2. **Fix it in code** (follow the `/docs` conventions and the `vercel-react-best-practices` skill for any React/Next.js changes).
3. Reset the test DB state and re-run the failing scenario.

Cap at **3 attempts on the same failure**. If it still fails after the third attempt, **stop** and report exactly what's blocking: the scenario, the observed vs. expected behavior, what you tried, and your best hypothesis. Do not keep looping.

## 6. On all green: report and stop

When every scenario passes, report a concise summary:

- Branch and plan file used.
- Each scenario tested, grouped by category (happy path / auth boundary / validation / edge cases), with pass status.
- Any code fixes applied along the way.

Then **stop**. Do not commit — committing is a separate, human-reviewed step (see `docs/git-conventions.md`).
