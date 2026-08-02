import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth/config";

// Next.js 16 renamed the `middleware` convention to `proxy` (same behavior).
// Runs on the edge, so it uses the edge-safe config only (no DB / bcrypt). The
// `authorized` callback enforces deny-by-default route protection as an
// optimistic check; identity is still enforced server-side in Server Actions
// (docs/auth.md).
export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except Next internals, the auth API, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
