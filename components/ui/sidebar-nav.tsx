"use client";

import type { ReactNode } from "react";

interface SidebarNavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  active: string;
  onSelect?: (id: string) => void;
  className?: string;
}

// Vertical icon+label rail for the admin console. The active item's icon sits
// in a filled ink circle; renders aria-current on it (docs/ui.md).
export function SidebarNav({
  items,
  active,
  onSelect,
  className = "",
}: SidebarNavProps) {
  return (
    <nav
      className={`flex w-24 flex-none flex-col items-center gap-[22px] ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelect?.(item.id)}
            className="group flex cursor-pointer flex-col items-center gap-1.5"
          >
            <span
              className={
                "flex size-12 items-center justify-center rounded-full transition-colors duration-150 [&_svg]:size-[22px] " +
                (isActive
                  ? "bg-ink text-white"
                  : "text-gray-500 group-hover:bg-gray-100 group-hover:text-ink")
              }
            >
              {item.icon}
            </span>
            <span
              className={
                "font-sans text-xs font-semibold " +
                (isActive ? "text-ink" : "text-gray-500")
              }
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
