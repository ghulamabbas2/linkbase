"use client";

import { useId, useState } from "react";

export interface AccordionItem {
  q: string;
  a: string;
}

interface AccordionProps {
  items: AccordionItem[];
  onDark?: boolean;
  /** Index open on mount; -1 = all closed. */
  defaultOpen?: number;
  className?: string;
}

const Chevron = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-[22px] block"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Single-open FAQ disclosure. One item open at a time; `onDark` styles it for
// color-block sections. Body height animates via grid-rows (0fr → 1fr),
// suppressed under prefers-reduced-motion.
export function Accordion({
  items,
  onDark = false,
  defaultOpen = -1,
  className = "",
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const baseId = useId();

  return (
    <div className={`flex w-full flex-col gap-3 font-sans ${className}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const headerId = `${baseId}-header-${i}`;
        return (
          <div
            key={i}
            className={
              "overflow-hidden rounded-xl border " +
              (onDark
                ? "border-white/[.12] bg-white/[.06]"
                : "border-gray-200 bg-white")
            }
          >
            <button
              type="button"
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className={
                "flex w-full cursor-pointer items-center justify-between gap-4 " +
                "px-[22px] py-5 text-left text-lg font-semibold " +
                (onDark ? "text-white" : "text-ink")
              }
            >
              <span>{item.q}</span>
              <span
                className={
                  "flex-none transition-transform duration-200 motion-reduce:transition-none " +
                  (isOpen ? "rotate-180" : "")
                }
              >
                <Chevron />
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={
                "grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none " +
                (isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
              }
            >
              <div className="overflow-hidden">
                <div
                  className={
                    "px-[22px] pb-[22px] text-base leading-relaxed " +
                    (onDark ? "text-white/75" : "text-gray-600")
                  }
                >
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
