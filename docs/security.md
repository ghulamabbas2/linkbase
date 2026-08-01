# Security

Baseline security practices for Linkbase. These are enforced across the whole app, not per-feature — treat them as defaults you must not regress.

## Secrets

Secrets live in **environment variables**, never in code or the repo.

- **`.env.local` holds real secrets and is gitignored.** It never gets committed. This is where local database URLs, NextAuth secrets, and provider keys go.
- **`.env.example` is checked in as a template.** It lists every variable the app expects with placeholder (non-secret) values, so a new environment can be set up by copying it to `.env.local` and filling in real values.
- Never hardcode a secret in source, log it, or send it to the client. Server-only values must not be prefixed `NEXT_PUBLIC_`.

## Security headers

Security headers are set centrally in `next.config.js`:

- **`Content-Security-Policy`** — restricts which sources scripts, styles, and other resources may load from, limiting the blast radius of injected content.
- **`X-Frame-Options`** — blocks the app from being embedded in an iframe, preventing clickjacking.
- **`Referrer-Policy`** — limits how much URL information is sent on outbound navigation.

Set these once at the config level so every route is covered by default.

## Rate limiting

Abuse-prone endpoints are rate limited:

- **Sign-in attempts** — throttled to slow credential-stuffing and brute-force attacks.
- **Link creation** — throttled to stop spam and automated flooding of a user's account.

## User-generated content

Link URLs and titles come from users and are treated as untrusted:

- **Escaped on render.** User content is rendered as text, never interpolated as raw HTML, so a malicious title or URL cannot inject markup or script (XSS).
- **Outbound links open safely.** External links use `rel="noopener noreferrer"` so the destination page cannot access `window.opener` or read the referrer.
