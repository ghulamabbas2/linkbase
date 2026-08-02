"use client";

import { Check, Copy, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Stable no-op subscription: the origin never changes over the page's life.
const subscribe = () => () => {};

interface JoinBannerProps {
  handle: string;
}

// Fixed marketing banner at the bottom of a public profile: shows the shareable
// URL with a copy button and a "Join on Linkbase" prompt. Dismissible for the
// session. Client-only because it owns copy + dismiss state and reads the
// browser origin.
export function JoinBanner({ handle }: JoinBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read the browser origin without a hydration mismatch: the server snapshot is
  // empty (renders the bare path), the client snapshot fills in the origin.
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
  const shareUrl = `${origin}/user/${handle}`;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (dismissed) return null;

  // Strip the protocol for a compact display, keep the full URL for copying.
  const displayUrl = shareUrl.replace(/^https?:\/\//, "");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked — no-op.
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end gap-3 bg-gradient-to-b from-transparent via-black/50 to-black/90 px-4 pb-6.5 pt-24">
      <div className="pointer-events-auto flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 rounded-full bg-white py-3 pr-3.5 pl-5 shadow-[var(--shadow-pop)]">
          <span className="truncate font-sans font-bold text-ink">
            {displayUrl}
          </span>
          <button
            type="button"
            onClick={onCopy}
            aria-label={copied ? "Link copied" : "Copy profile link"}
            className="flex size-7 flex-none cursor-pointer items-center justify-center rounded-full bg-gray-100 text-ink transition-colors hover:bg-gray-200 [&_svg]:size-4"
          >
            {copied ? <Check className="text-green" /> : <Copy />}
          </button>
        </div>
        <div className="text-center font-sans text-[15px] font-bold text-white">
          Join @{handle} on Linkbase today
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="pointer-events-auto absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white [&_svg]:size-4"
      >
        <X />
      </button>
    </div>
  );
}
