"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUserId, updateSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user";
import type { FieldErrors } from "@/lib/types/action-result";
import { selectHandleSchema } from "@/lib/validation/handle";

// Onboarding redirects on success, so the returned state only ever carries
// validation errors for the form to render inline (docs/errors-and-validation.md).
export type OnboardingActionState = {
  fieldErrors?: FieldErrors;
};

export type HandleStatus = "available" | "taken" | "invalid" | "reserved";

const RESERVED_MESSAGE = "That username is reserved";

// Live availability check for the onboarding field (debounced from the client).
// Read-only; the real guard is the unique index in `setHandle` below. Behind the
// session so it can't be probed by anonymous callers.
export async function checkHandleAvailability(
  raw: string,
): Promise<HandleStatus> {
  await requireUserId();

  const parsed = selectHandleSchema.safeParse({ handle: raw });
  if (!parsed.success) {
    // Distinguish a reserved name from a malformed one so the field can show an
    // accurate message rather than the generic "invalid characters" hint.
    const reserved = parsed.error.issues.some(
      (issue) => issue.message === RESERVED_MESSAGE,
    );
    return reserved ? "reserved" : "invalid";
  }

  await connectToDatabase();
  const existing = await User.findOne({ handle: parsed.data.handle }).select(
    "_id",
  );
  return existing ? "taken" : "available";
}

export async function setHandle(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  // 1. session — identity is taken from the server, never client input.
  const userId = await requireUserId();

  // 2. validation
  const parsed = selectHandleSchema.safeParse({ handle: formData.get("handle") });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { handle } = parsed.data;

  await connectToDatabase();

  // Pre-check for a friendly "taken" message; the unique index is the real guard.
  const taken = await User.findOne({ handle }).select("_id");
  if (taken) {
    return { fieldErrors: { handle: ["That username is taken"] } };
  }

  // 3. scope + 4. write. Set-once: only fill the handle while it is still unset,
  // so an already-onboarded user can't overwrite theirs.
  let matchedCount: number;
  try {
    const result = await User.updateOne(
      { _id: userId, handle: { $exists: false } },
      { $set: { handle } },
    );
    matchedCount = result.matchedCount;
  } catch (error) {
    // Unique-index race: another request claimed the same handle concurrently.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return { fieldErrors: { handle: ["That username is taken"] } };
    }
    throw error;
  }

  // Refresh the JWT so the proxy immediately sees the new handle (docs/auth.md).
  // Skip when nothing was written (user was already onboarded).
  if (matchedCount > 0) {
    await updateSession({ user: { handle } });
  }

  // 5. redirect to the dashboard now that onboarding is complete.
  redirect("/dashboard");
}
