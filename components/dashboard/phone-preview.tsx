import { Asterisk } from "lucide-react";

import type { LinkDTO } from "@/lib/dashboard/links";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { ShareButton } from "./share-button";

interface PhonePreviewProps {
  handle: string;
  links: LinkDTO[];
  footerOn: boolean;
}

// Read-only mock of the public profile, mirroring the editor's live link list so
// edits are reflected instantly. Outbound links open safely (docs/security.md).
export function PhonePreview({ handle, links, footerOn }: PhonePreviewProps) {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-gray-100 p-5 shadow-[var(--shadow-float)]">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="flex size-[34px] items-center justify-center rounded-full bg-white text-ink shadow-xs [&_svg]:size-[18px]">
          <Asterisk />
        </span>
        <ShareButton handle={handle} />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar name={handle} size="lg" />
        <div className="font-display text-xl font-extrabold tracking-tight text-ink">
          {handle}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {links.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            Your links will show up here.
          </p>
        ) : (
          links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[56px] items-center justify-center rounded-2xl bg-white px-6 text-center font-sans text-base font-bold leading-snug text-ink shadow-xs transition-transform duration-150 hover:scale-[1.015] hover:shadow-sm active:scale-[.99] motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              {link.title}
            </a>
          ))
        )}
      </div>

      {footerOn && (
        <div className="mt-5 text-center">
          <Badge variant="dark">Join {handle} on Linkbase</Badge>
        </div>
      )}
    </div>
  );
}
