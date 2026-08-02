import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig, isPublicPath } from "@/lib/auth/config";

// Next.js 16 renamed the `middleware` convention to `proxy` (same behavior).
// Runs on the edge, so it uses the edge-safe config only (no DB / bcrypt) and
// reads the handle off the JWT. This is the optimistic route gate; identity and
// ownership are still enforced server-side in Server Actions (docs/auth.md).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  // Public routes are always reachable.
  if (isPublicPath(pathname)) return;

  // Unauthenticated → sign in.
  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  const hasHandle = Boolean(req.auth.user.handle);
  const onOnboarding = pathname === "/onboarding";

  // Authenticated but no handle yet → funnel to onboarding.
  if (!hasHandle && !onOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // Already onboarded but still on onboarding → send to the dashboard.
  if (hasHandle && onOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  // Run on everything except Next internals, the auth API, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
