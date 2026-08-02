import Link from "next/link";

import type { PublicProfileDTO } from "@/lib/profile/public-profile";

import { ShareButton } from "@/components/dashboard/share-button";
import { Avatar } from "@/components/ui/avatar";
import { Wordmark } from "@/components/ui/wordmark";

import { JoinBanner } from "./join-banner";
import { ProfileLinks } from "./profile-links";

interface PublicProfileProps {
  profile: PublicProfileDTO;
}

// The public profile page body: brand bar, identity header, the link list, a
// footer, and the join banner. Read-only and unauthenticated — all data is
// already resolved and scoped by handle upstream (docs/data-fetching.md).
export function PublicProfile({ profile }: PublicProfileProps) {
  const { handle, links } = profile;

  return (
    <div className="relative flex min-h-screen justify-center bg-white">
      <div className="relative box-border w-full max-w-[620px] px-4 pt-4 pb-48 sm:px-7 sm:pt-6">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <Wordmark className="text-[19px]" />
          <ShareButton handle={handle} size="md" />
        </div>

        <header className="flex flex-col items-center gap-4 text-center">
          <Avatar name={handle} size="xl" className="shadow-[var(--shadow-card)]" />
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-[34px]">
            @{handle}
          </h1>
        </header>

        <ProfileLinks links={links} />

        <div className="mt-10 flex justify-center text-center font-sans text-[13px] font-medium text-gray-600">
          <Link href="/" className="hover:text-ink">
            More from Linkbase
          </Link>
        </div>
      </div>

      <JoinBanner handle={handle} />
    </div>
  );
}
