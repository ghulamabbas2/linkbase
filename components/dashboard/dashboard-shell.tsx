import {
  ArrowLeft,
  Asterisk,
  Contact,
  LayoutGrid,
  Paintbrush,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";

import type { LinkDTO } from "@/lib/dashboard/links";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/ui/sidebar-nav";

import { LinksWorkspace } from "./links-workspace";

interface DashboardShellProps {
  handle: string;
  links: LinkDTO[];
}

// Static admin chrome (promo bar, URL bar, sidebar rail). The interactive link
// editor + live preview live in the client LinksWorkspace island, keeping the
// client boundary low (docs/architecture.md). Sidebar/other tabs are
// presentational placeholders for this build.
const NAV_ITEMS = [
  { id: "content", label: "Content", icon: <LayoutGrid /> },
  { id: "header", label: "Header", icon: <Contact /> },
  { id: "design", label: "Design", icon: <Paintbrush /> },
  { id: "settings", label: "Settings", icon: <Settings /> },
];

export function DashboardShell({ handle, links }: DashboardShellProps) {
  return (
    <div className="min-h-dvh bg-black font-sans">
      {/* Promo bar */}
      <div className="flex min-h-14 flex-wrap items-center justify-center gap-4 px-5 py-3 text-center text-white">
        <span className="text-base font-semibold">
          Elevate your design with better themes and styles.
        </span>
        <Button variant="green" size="sm" leftIcon={<Zap />}>
          Upgrade
        </Button>
      </div>

      {/* Rounded workspace sheet */}
      <div className="min-h-[calc(100dvh-56px)] rounded-t-[24px] bg-gray-100">
        {/* URL bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7">
          <Link
            href="/"
            aria-label="Back to home"
            className="inline-flex size-11 items-center justify-center rounded-full border border-transparent bg-transparent text-gray-500 transition-[background-color,color,transform] duration-150 hover:bg-gray-100 hover:text-ink active:scale-[.94] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-5"
          >
            <ArrowLeft />
          </Link>
          <a
            href={`/user/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full transition-transform duration-150 hover:scale-[1.02] focus-visible:shadow-[var(--focus-ring)]"
            title="View your public profile"
          >
            <Badge variant="soft" leftIcon={<Asterisk />}>
              linkbase.to/{handle}
            </Badge>
          </a>
          <Button variant="outline" size="sm" leftIcon={<Sparkles />}>
            Enhance
          </Button>
        </div>

        {/* Sidebar rail + editor + preview */}
        <div className="mx-auto flex max-w-[1180px] items-start gap-7 px-4 pb-12 sm:px-7">
          <div className="hidden pt-1 lg:block">
            <SidebarNav items={NAV_ITEMS} active="content" />
          </div>
          <LinksWorkspace handle={handle} links={links} />
        </div>
      </div>
    </div>
  );
}
