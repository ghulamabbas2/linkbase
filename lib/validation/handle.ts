import { z } from "zod";

// Shared handle (username) schema (docs/errors-and-validation.md). Reused by the
// onboarding Server Action and its client form so the rules live in one place.

// Names that collide with routes/brand or are otherwise unsafe to hand out.
const RESERVED_HANDLES = new Set([
  "admin",
  "api",
  "user",
  "sign-in",
  "sign-up",
  "onboarding",
  "dashboard",
  "www",
]);

// Lowercased so uniqueness is case-insensitive; validations run after the
// trim/lowercase transforms so trailing spaces and casing can't sneak past.
const handle = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(
    /^[a-z0-9_-]+$/,
    "Use lowercase letters, numbers, hyphens, and underscores only",
  )
  .refine((value) => !RESERVED_HANDLES.has(value), "That username is reserved");

export const selectHandleSchema = z.object({ handle });

export type SelectHandleInput = z.infer<typeof selectHandleSchema>;
