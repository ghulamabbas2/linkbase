import type { ReactNode } from "react";

interface LinkRowProps {
  title: string;
  clicks?: number;
  domain?: string;
  // Glyph shown in the thumbnail when there is no image.
  thumbIcon?: ReactNode;
  // Trailing controls (e.g. a kebab menu) rendered on the right.
  actions?: ReactNode;
}

// Admin-side link row: thumbnail -> title + meta -> trailing actions. Titles are
// rendered as text (React escapes), never raw HTML (docs/security.md).
export function LinkRow({
  title,
  clicks = 0,
  domain,
  thumbIcon,
  actions,
}: LinkRowProps) {
  return (
    <div
      className={
        "flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white p-3 " +
        "shadow-xs transition-shadow duration-150 hover:shadow-sm"
      }
    >
      <span className="flex size-13 flex-none items-center justify-center rounded-xl bg-gray-100 text-gray-500 [&_svg]:size-[22px]">
        {thumbIcon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-base font-bold text-ink">
          {title}
        </p>
        <p className="mt-0.5 truncate font-sans text-sm text-gray-500">
          <b className="font-semibold text-gray-600">{clicks} clicks</b>
          {domain ? ` · ${domain}` : ""}
        </p>
      </div>
      {actions && <div className="flex flex-none items-center gap-1">{actions}</div>}
    </div>
  );
}
