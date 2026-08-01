"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HandleCtaFormProps {
  buttonVariant?: "primary" | "green";
  className?: string;
}

// Username capture used by the hero and final CTA. On submit it forwards the
// typed handle to the (future) sign-up route; empty input just refocuses.
export function HandleCtaForm({
  buttonVariant = "primary",
  className = "",
}: HandleCtaFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [handle, setHandle] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = handle.trim();
    if (!value) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/sign-up?handle=${encodeURIComponent(value)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex max-w-[480px] flex-wrap gap-3 ${className}`}
    >
      <div className="min-w-[200px] flex-1">
        <Input
          ref={inputRef}
          prefix="linkbase.to/"
          placeholder="yourname"
          aria-label="Choose your username"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
        />
      </div>
      <Button type="submit" variant={buttonVariant} size="lg">
        Get started
      </Button>
    </form>
  );
}
