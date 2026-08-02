"use client";

import { AtSign, Plus } from "lucide-react";
import { useState } from "react";

import type { LinkDTO } from "@/lib/dashboard/links";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";

import { AddLinkDialog } from "./add-link-dialog";
import { DashboardLinkRow } from "./link-row";
import { PhonePreview } from "./phone-preview";

interface LinksWorkspaceProps {
  handle: string;
  links: LinkDTO[];
}

// Owns the editable link list for the session. Server Actions persist each
// change; we mirror the returned canonical DTO into local state so the list and
// the phone preview update immediately (docs/data-fetching.md, data-mutations.md).
export function LinksWorkspace({ handle, links: initialLinks }: LinksWorkspaceProps) {
  const [links, setLinks] = useState<LinkDTO[]>(initialLinks);
  const [addOpen, setAddOpen] = useState(false);
  const [footerOn, setFooterOn] = useState(true);

  function handleCreated(link: LinkDTO) {
    setLinks((prev) => [link, ...prev]);
  }

  function handleUpdated(updated: LinkDTO) {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  function handleDeleted(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="flex w-full flex-col items-start gap-7 lg:flex-row">
      {/* Editor column */}
      <div className="w-full min-w-0 flex-1 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 lg:max-w-[640px]">
        <h1 className="mb-5 font-display text-3xl font-extrabold tracking-tight text-ink">
          Content
        </h1>

        <Tabs tabs={[{ id: "links", label: "Links" }]} active="links" />

        <div className="mt-5 mb-5 flex items-center gap-3.5">
          <Avatar name={handle} size="sm" />
          <div>
            <div className="font-sans text-lg font-bold text-ink">{handle}</div>
            <div className="mt-0.5 flex items-center gap-1 font-sans text-sm font-medium text-gray-500 [&_svg]:size-[15px]">
              <AtSign />
              {handle}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          leftIcon={<Plus />}
          onClick={() => setAddOpen(true)}
          className="mb-5"
        >
          Add
        </Button>

        {links.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500">
            No links yet. Add your first one above.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <DashboardLinkRow
                key={link.id}
                link={link}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

        <div className="my-6 border-t border-gray-200" />

        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-[18px]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-sans text-base font-bold text-ink">
              Linkbase footer
            </span>
            <Toggle
              label="Show Linkbase footer"
              checked={footerOn}
              onChange={(e) => setFooterOn(e.target.checked)}
            />
          </div>
          <div className="font-display text-2xl font-black text-ink">
            Link<span className="text-green">base</span>
          </div>
        </div>
      </div>

      {/* Live phone preview */}
      <div className="w-full lg:sticky lg:top-4 lg:w-[300px] lg:flex-none">
        <PhonePreview handle={handle} links={links} footerOn={footerOn} />
      </div>

      <AddLinkDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
