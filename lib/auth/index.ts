import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user";
import { signInSchema } from "@/lib/validation/auth";

import { authConfig } from "./config";

// Full auth instance (Node runtime). Extends the edge-safe config with the
// Credentials provider whose `authorize` reads MongoDB and verifies the hash.
export const {
  handlers,
  auth,
  signIn,
  signOut,
  // Refreshes the JWT (fires the `jwt` callback with `trigger: "update"`); the
  // onboarding action calls it after saving the handle so the proxy sees it.
  unstable_update: updateSession,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await connectToDatabase();
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          handle: user.handle ?? undefined,
        };
      },
    }),
  ],
});

/**
 * Resolve the signed-in user's id, or throw if there is no session. Use at the
 * start of Server Actions and data-access functions to enforce identity on the
 * server (docs/auth.md, docs/data-mutations.md).
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: no active session");
  }
  return session.user.id;
}
