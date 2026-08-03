import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicProfile } from "@/lib/profile/public-profile";

import { PublicProfile } from "@/components/profile/public-profile";

// Public profile route — reachable without a session (proxy allows `/user/*`).
// `params` is a Promise in Next 16 and must be awaited.
interface PublicProfilePageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);

  if (!profile) return { title: "Profile not found · Linkbase" };

  return {
    title: `@${profile.handle} · Linkbase`,
    description: `${profile.handle}'s links on Linkbase.`,
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);

  if (!profile) notFound();

  return <PublicProfile profile={profile} />;
}
