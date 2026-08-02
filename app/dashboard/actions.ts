"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserId } from "@/lib/auth";
import { toLinkDTO, type LinkDTO } from "@/lib/dashboard/links";
import { connectToDatabase } from "@/lib/db/connect";
import { Link } from "@/lib/db/models/link";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/types/action-result";
import {
  createLinkSchema,
  linkIdSchema,
  updateLinkSchema,
} from "@/lib/validation/link";

// All three actions follow the ordered sequence (docs/data-mutations.md):
// session -> validate -> scope to userId -> write -> revalidate, returning a
// typed result. Expected failures are returned, never thrown.

export async function createLink(
  input: unknown,
): Promise<ActionResult<LinkDTO>> {
  // 1. session
  const userId = await requireUserId();

  // 2. validation
  const parsed = createLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  // Throttle creation to stop spam/flooding (docs/security.md).
  if (!rateLimit(`create-link:${userId}`, 20, 60_000)) {
    return {
      ok: false,
      fieldErrors: { form: ["Too many links created just now — try again in a minute."] },
    };
  }

  // 3. scope + 4. write — userId comes from the session, never the payload.
  await connectToDatabase();
  const link = await Link.create({ ...parsed.data, userId });

  // 5. revalidate
  revalidatePath("/dashboard");

  return { ok: true, data: toLinkDTO(link.toObject()) };
}

export async function updateLink(
  input: unknown,
): Promise<ActionResult<LinkDTO>> {
  const userId = await requireUserId();

  const parsed = updateLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { id, title, url } = parsed.data;

  await connectToDatabase();
  // Scoped update: only the owner's row matches, so another user's id no-ops.
  const link = await Link.findOneAndUpdate(
    { _id: id, userId },
    { title, url },
    { new: true },
  ).lean();

  if (!link) {
    return { ok: false, fieldErrors: { form: ["Link not found"] } };
  }

  revalidatePath("/dashboard");

  return { ok: true, data: toLinkDTO(link) };
}

export async function deleteLink(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();

  const parsed = linkIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { id } = parsed.data;

  await connectToDatabase();
  // Scoped delete: a mismatched owner deletes nothing.
  const result = await Link.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) {
    return { ok: false, fieldErrors: { form: ["Link not found"] } };
  }

  revalidatePath("/dashboard");

  return { ok: true, data: { id } };
}
