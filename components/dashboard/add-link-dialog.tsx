"use client";

import { useState, useTransition } from "react";
import { z } from "zod";

import { createLink } from "@/app/dashboard/actions";
import type { LinkDTO } from "@/lib/dashboard/links";
import { createLinkSchema } from "@/lib/validation/link";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AddLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (link: LinkDTO) => void;
}

type Errors = { title?: string; url?: string; form?: string };

export function AddLinkDialog({ open, onClose, onCreated }: AddLinkDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setUrl("");
    setErrors({});
  }

  function close() {
    reset();
    onClose();
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Client-side check with the shared schema for instant feedback; the server
    // action re-validates as the source of truth (docs/errors-and-validation.md).
    const parsed = createLinkSchema.safeParse({ title, url });
    if (!parsed.success) {
      const flat = z.flattenError(parsed.error).fieldErrors;
      setErrors({ title: flat.title?.[0], url: flat.url?.[0] });
      return;
    }

    startTransition(async () => {
      const result = await createLink(parsed.data);
      if (result.ok) {
        onCreated(result.data);
        close();
        return;
      }
      const fe = result.fieldErrors;
      setErrors({
        title: fe.title?.[0],
        url: fe.url?.[0],
        form: fe.form?.[0],
      });
    });
  }

  return (
    <Dialog open={open} onClose={close} title="Add a link">
      <form onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
        <div>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">
            Add a link
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Give it a title and where it points.
          </p>
        </div>

        <Input
          label="Title"
          placeholder="My latest video"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          maxLength={100}
          autoFocus
        />
        <Input
          label="URL"
          placeholder="https://example.com"
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
          <Button type="button" variant="ghost" onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Adding…" : "Add link"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
