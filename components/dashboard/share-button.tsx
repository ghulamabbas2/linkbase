"use client";

import { Check, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";

interface ShareButtonProps {
  handle: string;
}

// Shares the user's public profile URL: native share sheet when available,
// otherwise copies the link to the clipboard and shows brief confirmation.
export function ShareButton({ handle }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function onShare() {
    const url = `${window.location.origin}/user/${handle}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `@${handle} on Linkbase`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // User dismissed the share sheet or clipboard was blocked — no-op.
    }
  }

  return (
    <IconButton
      variant="white"
      size="sm"
      label={copied ? "Link copied" : "Share profile"}
      onClick={onShare}
    >
      {copied ? <Check /> : <Share2 />}
    </IconButton>
  );
}
