"use client";

import { Link as LinkIcon, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { z } from "zod";

import { deleteLink, updateLink } from "@/app/dashboard/actions";
import type { LinkDTO } from "@/lib/dashboard/links";
import { updateLinkSchema } from "@/lib/validation/link";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { LinkRow } from "@/components/ui/link-row";

import { ConfirmDialog } from "./confirm-dialog";

interface DashboardLinkRowProps {
  link: LinkDTO;
  onUpdated: (link: LinkDTO) => void;
  onDeleted: (id: string) => void;
}

type Errors = { title?: string; url?: string; form?: string };

export function DashboardLinkRow({
  link,
  onUpdated,
  onDeleted,
}: DashboardLinkRowProps) {
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  function startEdit() {
    setTitle(link.title);
    setUrl(link.url);
    setErrors({});
    setMenuOpen(false);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setErrors({});
  }

  function save(event: React.FormEvent) {
    event.preventDefault();

    const parsed = updateLinkSchema.safeParse({ id: link.id, title, url });
    if (!parsed.success) {
      const flat = z.flattenError(parsed.error).fieldErrors;
      setErrors({ title: flat.title?.[0], url: flat.url?.[0] });
      return;
    }

    startTransition(async () => {
      const result = await updateLink(parsed.data);
      if (result.ok) {
        onUpdated(result.data);
        setEditing(false);
        return;
      }
      const fe = result.fieldErrors;
      setErrors({ title: fe.title?.[0], url: fe.url?.[0], form: fe.form?.[0] });
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteLink({ id: link.id });
      if (result.ok) {
        onDeleted(link.id);
        return;
      }
      setConfirmOpen(false);
      setErrors({ form: result.fieldErrors.form?.[0] });
    });
  }

  if (editing) {
    return (
      <form
        onSubmit={save}
        className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs"
      >
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          maxLength={100}
          autoFocus
        />
        <Input
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={errors.url}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {errors.form && (
          <p className="text-sm text-berry" role="alert">
            {errors.form}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelEdit}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <>
      <LinkRow
        title={link.title}
        clicks={link.clicks}
        domain={link.domain}
        thumbIcon={<LinkIcon />}
        actions={
          <div className="relative">
            <IconButton
              variant="ghost"
              size="sm"
              label="Link options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreHorizontal />
            </IconButton>

            {menuOpen && (
              <>
                {/* Click-catcher to dismiss the menu on an outside click. */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+4px)] z-20 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-[var(--shadow-pop)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={startEdit}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left font-sans text-sm font-medium text-ink hover:bg-gray-50 [&_svg]:size-4 [&_svg]:text-gray-500"
                  >
                    <Pencil />
                    Edit
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmOpen(true);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left font-sans text-sm font-medium text-berry hover:bg-gray-50 [&_svg]:size-4"
                  >
                    <Trash2 />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this link?"
        message={`“${link.title}” will be removed from your Linkbase. This can’t be undone.`}
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
