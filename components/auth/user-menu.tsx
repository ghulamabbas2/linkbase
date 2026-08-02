"use client";

import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/app/(auth)/actions";

interface UserMenuProps {
  email: string;
  handle?: string;
}

// Logged-in identity control for the header: avatar trigger → dropdown menu.
// Small client island so the surrounding header stays a Server Component.
export function UserMenu({ email, handle }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = (email.charAt(0) || "?").toUpperCase();

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex size-11 items-center justify-center rounded-full bg-ink font-display text-base font-bold text-white transition-transform duration-150 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        {initial}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-pop)]"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">
              {handle ? `@${handle}` : email}
            </p>
            {handle ? (
              <p className="truncate text-xs text-gray-500">{email}</p>
            ) : null}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-3 text-left text-sm font-medium text-ink hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
