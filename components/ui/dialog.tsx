"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  // Accessible title, wired to the dialog via aria-labelledby.
  title: string;
  titleId?: string;
  children: ReactNode;
  className?: string;
}

// Accessible modal built on the native <dialog> element: showModal() gives us
// the top layer, backdrop, focus trap, and Esc-to-close for free.
export function Dialog({
  open,
  onClose,
  title,
  titleId = "dialog-title",
  children,
  className = "",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Route Esc through our controlled close so state stays in sync.
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) onClose();
      }}
      className={
        "m-auto w-[min(440px,calc(100vw-32px))] rounded-3xl border border-gray-200 bg-white p-0 " +
        "shadow-[var(--shadow-pop)] backdrop:bg-black/40 " +
        className
      }
    >
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
