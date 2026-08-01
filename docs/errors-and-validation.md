# Errors & Validation

How Linkbase validates input and handles errors across Server Actions and the UI.

## Validation with Zod

- **All input is validated with Zod at the Server Action boundary**, before touching the database. An action parses its input first; nothing reaches a query until it has passed validation.
- **Shared schemas live in `lib/validation`.** Define each schema once and reuse it across the actions (and any client-side checks) that need it, rather than re-declaring shapes inline.

## Two kinds of failure

Validation failures and unexpected errors are handled differently.

### Validation errors — returned, never thrown

A validation failure is an expected outcome, so it is **returned as a typed result object**, not thrown:

- The action returns a discriminated result the form can render **inline next to the offending fields**.
- The form reads the field-level messages from that result and displays them in place.

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string[]> };
```

The happy path returns `ok: true`; a Zod parse failure returns `ok: false` with per-field messages. The form never crashes on bad input — it just shows the errors.

### Unexpected errors — thrown and caught by `error.tsx`

An unexpected error (a failed query, a downstream outage, a bug) is a real `Error` and is **thrown**:

- The **nearest `error.tsx`** boundary catches it and renders a fallback UI.
- The error is **logged with enough context to debug** — the action name, relevant ids, and the original error.

## Never leak internals to the client

**Never expose raw error messages or stack traces to the client.** The user sees a generic, friendly message from the error boundary; the detailed error goes to the server logs only. Field-level validation messages (safe, user-facing copy) are the only error text that crosses to the client.
