import { connectToDatabase } from "@/lib/db/connect";
import { Link } from "@/lib/db/models/link";

// The serializable link shape passed from Server Components/Actions to the
// client. Never hand a raw Mongoose document across the boundary
// (docs/data-fetching.md) — `domain` is derived here, not stored.
export interface LinkDTO {
  id: string;
  title: string;
  url: string;
  domain: string;
  clicks: number;
}

// Best-effort display host, e.g. "https://www.example.com/x" -> "example.com".
// URLs are validated before persistence, but guard anyway so a legacy row can't
// throw during render.
function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Minimal shape a persisted link exposes once read back (lean row or a doc's
// `.toObject()`): the schema fields plus the generated `_id`.
type PersistedLink = { _id: unknown; title: string; url: string; clicks?: number };

export function toLinkDTO(doc: PersistedLink): LinkDTO {
  return {
    id: String(doc._id),
    title: doc.title,
    url: doc.url,
    domain: domainFromUrl(doc.url),
    clicks: doc.clicks ?? 0,
  };
}

// All links for one owner, newest first. Scoped to `userId` — the mandatory
// per-user authorization boundary (docs/database.md).
export async function getLinksForUser(userId: string): Promise<LinkDTO[]> {
  await connectToDatabase();
  const docs = await Link.find({ userId }).sort({ createdAt: -1 }).lean();
  return docs.map((doc) => toLinkDTO(doc as unknown as PersistedLink));
}
