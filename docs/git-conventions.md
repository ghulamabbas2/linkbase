# Git Conventions

How commits, branches, and pull requests are structured in Linkbase. Follow these on every change — a clean, readable history is a hard requirement, not a preference.

## Commits

Commits follow **[Conventional Commits](https://www.conventionalcommits.org/)**: a type prefix followed by a short, imperative subject.

- **Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- **Subject:** short and imperative — "add link reordering", not "added" or "adds".

```
feat: add link reordering to dashboard
fix: redirect to sign-in on expired session
docs: document rate limiting in security.md
```

## Branches

Each feature is built on **its own branch**, named by type and feature:

```
feat/add-links
fix/session-redirect
```

Use the same type prefixes as commits, followed by a short kebab-case description of the work.

## Pull requests

- **Never commit straight to `main`.** All work reaches `main` through a pull request from its feature branch.
- **Keep a clean history.** PRs should present a tidy, reviewable set of commits.
- **Human review is required before merge.** Every PR goes through the human review step — no self-merging past review.
