import { MoreVertical } from "lucide-react";

import type { LinkDTO } from "@/lib/dashboard/links";

interface ProfileLinksProps {
  links: LinkDTO[];
}

// The public list of a profile's links. Each opens in a new tab and is isolated
// from this page via `rel="noopener noreferrer"` (docs/security.md). Titles are
// rendered as text — React escapes them — never as raw HTML. URLs are validated
// to http/https at creation (lib/validation/link.ts), so hrefs are safe.
export function ProfileLinks({ links }: ProfileLinksProps) {
  if (links.length === 0) {
    return (
      <p className="mt-9 text-center font-sans text-base text-gray-500">
        No links yet.
      </p>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4 sm:mt-9">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex min-h-16 w-full items-center justify-center rounded-2xl bg-white px-15 py-4 shadow-xs transition-[transform,box-shadow] duration-150 hover:scale-[1.015] hover:shadow-sm active:scale-[.99] motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <span className="text-center font-sans text-base font-bold leading-tight text-ink">
            {link.title}
          </span>
          <span
            aria-hidden
            className="absolute top-1/2 right-4 flex -translate-y-1/2 text-gray-400 [&_svg]:size-[18px]"
          >
            <MoreVertical />
          </span>
        </a>
      ))}
    </div>
  );
}
