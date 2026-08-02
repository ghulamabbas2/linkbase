import { toLinkDTO, type LinkDTO } from "@/lib/dashboard/links";
import { connectToDatabase } from "@/lib/db/connect";
import { Link } from "@/lib/db/models/link";
import { User } from "@/lib/db/models/user";

// A user's public profile: their handle plus the links they show, newest first.
// This is public data, so it is scoped by `handle` rather than a session
// `userId` (docs/data-fetching.md).
export interface PublicProfileDTO {
  handle: string;
  links: LinkDTO[];
}

// Minimal shape read back from the users collection.
type PersistedUser = { _id: unknown; handle?: string | null };

// Look up a public profile by handle. Handles are stored lowercased
// (lib/validation/handle.ts), so we lowercase the incoming segment before the
// lookup — `/user/GabbasDev` resolves to the stored `gabbasdev`. Returns `null`
// when no user owns the handle, so the caller can `notFound()`.
export async function getPublicProfile(
  handle: string,
): Promise<PublicProfileDTO | null> {
  await connectToDatabase();

  const user = await User.findOne({ handle: handle.toLowerCase() })
    .select("_id handle")
    .lean<PersistedUser>();

  if (!user?.handle) return null;

  const docs = await Link.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();

  return {
    handle: user.handle,
    links: docs.map((doc) =>
      toLinkDTO(doc as unknown as Parameters<typeof toLinkDTO>[0]),
    ),
  };
}
