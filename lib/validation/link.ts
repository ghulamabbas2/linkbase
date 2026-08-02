import { z } from "zod";

// Shared link schemas (docs/errors-and-validation.md). Reused by the Server
// Actions and the client forms (Add dialog + inline row edit) so the rules live
// in one place.

const title = z
  .string()
  .trim()
  .min(1, "Enter a title")
  .max(100, "Title must be at most 100 characters");

// http/https only. z.url validates WHATWG URL shape; the protocol regex rejects
// mailto:/ftp:/etc. and the domain regex requires a real hostname (verified as
// the Zod v4 form). Trim first so trailing spaces can't sneak past.
const url = z
  .string()
  .trim()
  .pipe(
    z.url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: "Enter a valid link starting with http:// or https://",
    }),
  );

// Mongo ObjectId as it arrives from the client (24 hex chars).
const id = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid link id");

export const createLinkSchema = z.object({ title, url });
export const updateLinkSchema = z.object({ id, title, url });
export const linkIdSchema = z.object({ id });

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
