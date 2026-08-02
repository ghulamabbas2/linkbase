"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { z } from "zod";

import { signIn, signOut } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user";
import { rateLimit } from "@/lib/rate-limit";
import type { FieldErrors } from "@/lib/types/action-result";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

// Auth actions redirect on success, so the returned state only ever carries
// validation/credential errors for the form to render inline.
export type AuthActionState = {
  fieldErrors?: FieldErrors;
};

// Where new users land after authenticating. Existing users are routed by handle
// (see below). We resolve the destination here rather than relying on the proxy
// to bounce the sign-in redirect (the freshly-set session cookie isn't reliably
// readable on that first hop) — and, critically, rather than letting the
// onboarding page re-redirect handle-holders: a Server Action redirect that
// lands on a page which immediately redirects again renders the final page's
// content while leaving the action's URL in the address bar (docs/auth.md).
const ONBOARDING_REDIRECT = "/onboarding";
const DASHBOARD_REDIRECT = "/dashboard";

async function clientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!rateLimit(`signup:${await clientKey()}`)) {
    return { fieldErrors: { email: ["Too many attempts. Please try again shortly."] } };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password } = parsed.data;

  await connectToDatabase();

  const existing = await User.findOne({ email }).select("_id");
  if (existing) {
    return { fieldErrors: { email: ["An account with this email already exists"] } };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await User.create({ email, passwordHash });
  } catch (error) {
    // Unique-index race: another request created the same email concurrently.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        fieldErrors: { email: ["An account with this email already exists"] },
      };
    }
    throw error;
  }

  // Brand-new account: no handle yet, so always start onboarding.
  // Establishes the session and throws a redirect (handled by Next.js).
  await signIn("credentials", {
    email,
    password,
    redirectTo: ONBOARDING_REDIRECT,
  });

  return {};
}

export async function signInWithCredentials(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!rateLimit(`signin:${await clientKey()}`)) {
    return { fieldErrors: { email: ["Too many attempts. Please try again shortly."] } };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  // Route existing users by onboarding state so the redirect lands directly on
  // the right page (no chained page-level redirect). The handle lookup is only
  // used to pick the destination; `signIn` still enforces the password, so an
  // email that exists but fails auth never reaches the redirect.
  await connectToDatabase();
  const user = await User.findOne({ email: parsed.data.email }).select("handle");
  const redirectTo = user?.handle ? DASHBOARD_REDIRECT : ONBOARDING_REDIRECT;

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    // Invalid credentials surface as an AuthError; return a generic message and
    // never leak internals (docs/errors-and-validation.md). A successful sign-in
    // throws a redirect (not an AuthError), which we re-throw for Next.js.
    if (error instanceof AuthError) {
      return { fieldErrors: { password: ["Invalid email or password"] } };
    }
    throw error;
  }

  return {};
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
