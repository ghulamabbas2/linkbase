import type { DefaultSession } from "next-auth";

// Expose our own identity fields on the session/user/JWT. `id` is the Mongoose
// `_id`; `handle` is the (optional) public profile handle set later by the
// select-handle feature.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      handle?: string;
    } & DefaultSession["user"];
  }

  interface User {
    handle?: string;
  }
}

// The callback `token` param binds to the JWT interface from `@auth/core/jwt`
// (which `next-auth/jwt` merely re-exports), so augment the source module.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    handle?: string;
  }
}
