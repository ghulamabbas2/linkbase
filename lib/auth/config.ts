import type { NextAuthConfig } from "next-auth";

// Public routes reachable without a session (docs/auth.md, docs/routing.md).
// Everything else is deny-by-default.
function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname.startsWith("/user/")
  );
}

// Edge-safe config: no database or bcrypt imports, so it can run in middleware.
// The Credentials provider (which touches MongoDB) is added in `./index` for
// the Node runtime only.
export const authConfig = {
  pages: { signIn: "/sign-in" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    // Gates route access in middleware. Returning `false` on a protected route
    // redirects to the sign-in page.
    authorized({ auth, request: { nextUrl } }) {
      if (isPublicPath(nextUrl.pathname)) return true;
      return Boolean(auth?.user);
    },
    // Copy identity onto the token at sign-in; it is then exposed on the session.
    // `user` is the loose provider/adapter union here, so read our fields off a
    // narrowed shape (they are set by the Credentials `authorize` return).
    jwt({ token, user }) {
      if (user) {
        const identity = user as { id?: string; handle?: string };
        token.id = identity.id;
        token.handle = identity.handle;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      session.user.handle = token.handle;
      return session;
    },
  },
} satisfies NextAuthConfig;
