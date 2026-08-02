"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  checkHandleAvailability,
  setHandle,
  type HandleStatus,
  type OnboardingActionState,
} from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";

// Field states, mirroring the Welcome design. "idle" before typing, "short" /
// "invalid" fail locally, "checking" awaits the server, then "available"/"taken".
type FieldStatus = "idle" | "short" | "invalid" | "checking" | HandleStatus;

const HANDLE_RE = /^[a-z0-9_-]+$/;
const MIN = 3;
const MAX = 30;

const initialState: OnboardingActionState = {};

const HINTS: Record<FieldStatus, [string, string]> = {
  idle: ["Choose something short and memorable.", "var(--gray-500)"],
  short: [`Usernames need at least ${MIN} characters.`, "var(--berry)"],
  invalid: [
    "Use lowercase letters, numbers, hyphens, and underscores only.",
    "var(--berry)",
  ],
  reserved: ["That username is reserved.", "var(--berry)"],
  checking: ["Checking availability…", "var(--gray-500)"],
  available: ["Nice — that one’s all yours.", "var(--green)"],
  taken: ["That username is already taken.", "var(--berry)"],
};

function statusIcon(status: FieldStatus) {
  if (status === "checking") {
    return (
      <span
        aria-hidden
        className="inline-block size-[18px] rounded-full border-[2.4px] border-gray-300 [border-top-color:var(--gray-600)] motion-safe:animate-[wp-spin_.7s_linear_infinite]"
      />
    );
  }
  if (status === "available") {
    return (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (
    status === "taken" ||
    status === "invalid" ||
    status === "reserved" ||
    status === "short"
  ) {
    return (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--berry)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
      </svg>
    );
  }
  return null;
}

function suggestionsFor(handle: string): string[] {
  const base = handle.replace(/[^a-z0-9]/g, "") || "creator";
  const n = 10 + Math.floor(Math.random() * 89);
  return [`the${base}`, `${base}-${n}`, `${base}_official`]
    .map((s) => s.slice(0, MAX))
    .slice(0, 3);
}

export function OnboardingWelcome() {
  const [handle, setHandleValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<FieldStatus>("idle");
  const [state, formAction, pending] = useActionState(setHandle, initialState);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function onInput(value: string) {
    const raw = value.toLowerCase().replace(/\s+/g, "");
    setHandleValue(raw);

    if (timer.current) clearTimeout(timer.current);

    if (raw.length === 0) return setStatus("idle");
    if (raw.length < MIN) return setStatus("short");
    if (!HANDLE_RE.test(raw)) return setStatus("invalid");

    setStatus("checking");
    const id = ++seq.current;
    timer.current = setTimeout(async () => {
      const result = await checkHandleAvailability(raw);
      // Ignore stale responses if the field changed while we waited.
      if (id === seq.current) setStatus(result);
    }, 550);
  }

  // A failed submit (e.g. a uniqueness race) comes back as a field error.
  const submitError = state.fieldErrors?.handle?.[0];
  const [hintText, hintColor] = submitError
    ? [submitError, "var(--berry)"]
    : HINTS[status];

  const previewHandle = handle || "yourname";
  const avatarInitial = (handle[0] ?? "y").toUpperCase();
  const showSuggestions = status === "taken";
  const continueDisabled = status !== "available" || pending;

  const isError =
    status === "taken" ||
    status === "invalid" ||
    status === "reserved" ||
    status === "short" ||
    Boolean(submitError);
  const borderColor =
    status === "available"
      ? "var(--green)"
      : isError
        ? "var(--berry)"
        : focused
          ? "var(--border-strong)"
          : "transparent";
  const ring =
    focused && (status === "idle" || status === "checking" || status === "available")
      ? "0 0 0 3px rgba(28,180,84,.30)"
      : "none";

  let pillText = "Pick a username";
  let dotColor = "var(--gray-300)";
  let pillIcon: React.ReactNode = null;
  if (status === "available") {
    pillText = `${previewHandle} is available`;
    dotColor = "var(--green)";
    pillIcon = statusIcon("available");
  } else if (status === "checking") {
    pillText = "Checking…";
    dotColor = "var(--gray-200)";
    pillIcon = statusIcon("checking");
  } else if (status === "taken") {
    pillText = "Try another";
    dotColor = "var(--berry)";
    pillIcon = <span className="text-[13px] font-bold text-white">!</span>;
  } else if (handle) {
    pillText = previewHandle;
    dotColor = "var(--grape)";
  }

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-white font-sans md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <style>{`
        @keyframes wp-spin{to{transform:rotate(360deg)}}
        @keyframes wp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes wp-pop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>

      {/* Left — form */}
      <section className="flex flex-col px-[clamp(24px,6vw,64px)] pt-7 pb-9">
        <div className="flex items-center justify-between">
          <span className="font-display text-[26px] font-black tracking-[-.02em] text-ink">
            link<span className="text-green">base</span>
          </span>
          <span className="text-sm text-gray-500">
            Already have one?{" "}
            <a href="/sign-in" className="font-semibold text-ink hover:text-gray-600">
              Log in
            </a>
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <form action={formAction} className="mx-auto w-full max-w-[440px] px-1">
            <input type="hidden" name="handle" value={handle} />

            <div className="mb-[22px] flex items-center gap-2">
              <span className="flex gap-[5px]">
                <span className="h-[5px] w-[22px] rounded-full bg-green" />
                <span className="h-[5px] w-[9px] rounded-full bg-gray-200" />
                <span className="h-[5px] w-[9px] rounded-full bg-gray-200" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[.02em] text-gray-400">
                Step 1
              </span>
            </div>

            <h1 className="mb-3 font-display text-[clamp(34px,5vw,46px)] font-extrabold leading-[1.05] tracking-[-.02em] text-ink">
              Welcome to Linkbase!
            </h1>
            <p className="mb-7 max-w-[400px] text-[17px] leading-[1.5] text-gray-500">
              Claim your username — it’s the link you’ll share everywhere. Choose
              carefully: this can’t be changed later.
            </p>

            <label htmlFor="wp-handle" className="mb-2 block text-sm font-semibold text-ink">
              Your username
            </label>
            <div
              className="flex h-14 items-center gap-1 rounded-xl border-[1.5px] px-4 transition-[background-color,border-color,box-shadow] duration-150"
              style={{
                background: focused ? "var(--white)" : "var(--gray-100)",
                borderColor,
                boxShadow: ring,
              }}
            >
              <span className="whitespace-nowrap text-base text-gray-500">
                linkbase.to/
              </span>
              <input
                id="wp-handle"
                type="text"
                value={handle}
                onChange={(e) => onInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="yourname"
                maxLength={MAX}
                className="min-w-0 flex-1 border-none bg-transparent font-sans text-base font-medium text-ink outline-none placeholder:font-normal placeholder:text-gray-400"
              />
              <span className="flex flex-none items-center">{statusIcon(status)}</span>
            </div>
            <div
              className="mt-2 min-h-5 text-[13px] font-medium"
              style={{ color: hintColor }}
              aria-live="polite"
            >
              {hintText}
            </div>

            {showSuggestions && (
              <div className="mt-1.5">
                <div className="mb-2.5 text-[13px] text-gray-500">
                  Try one of these instead:
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestionsFor(handle).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onInput(s)}
                      className="cursor-pointer rounded-full border border-transparent bg-gray-100 px-3.5 py-2 font-sans text-sm font-medium text-ink transition-[background-color,border-color] hover:border-gray-300 hover:bg-white"
                    >
                      linkbase.to/{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={continueDisabled}
              >
                {pending ? "Setting up…" : "Continue"}
              </Button>
            </div>
            <p className="mt-4 text-center text-xs leading-[1.5] text-gray-400">
              By continuing you agree to Linkbase’s{" "}
              <a href="#" className="text-gray-500 underline">
                Terms
              </a>
              .
            </p>
          </form>
        </div>
      </section>

      {/* Right — live preview */}
      <section className="relative hidden items-center justify-center overflow-hidden bg-chartreuse p-10 md:flex">
        <div className="absolute -right-[90px] -top-[90px] size-[300px] rounded-full bg-white/[.28]" />
        <div className="absolute -bottom-[120px] -left-[70px] size-[360px] rounded-full [background:rgba(97,43,155,.14)]" />

        <div className="relative w-[300px] motion-safe:animate-[wp-float_6s_ease-in-out_infinite]">
          <div className="absolute -left-[46px] -top-[26px] z-[3] flex items-center gap-2 rounded-full bg-white py-[9px] pl-2.5 pr-4 [box-shadow:0_12px_30px_rgba(0,0,0,.16)] motion-safe:animate-[wp-pop_.3s_ease_both]">
            <span
              className="flex size-[26px] flex-none items-center justify-center rounded-full"
              style={{ background: dotColor }}
            >
              {pillIcon}
            </span>
            <span className="font-sans text-sm font-semibold text-ink">
              {pillText}
            </span>
          </div>

          <div className="rounded-[28px] bg-white px-[22px] py-[26px] [box-shadow:0_30px_60px_rgba(0,0,0,.22)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-[76px] items-center justify-center rounded-full font-display text-[30px] font-extrabold text-white [background:linear-gradient(135deg,var(--grape),var(--berry))]">
                {avatarInitial}
              </div>
              <div className="mt-3.5 font-display text-[19px] font-extrabold text-ink">
                Your name
              </div>
              <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full bg-gray-100 px-3 py-[5px] text-[13px] font-semibold text-gray-600">
                <span className="text-gray-400">linkbase.to/</span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-ink">
                  {previewHandle}
                </span>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-[11px]">
              <div className="flex h-[46px] items-center rounded-[14px] bg-gray-100 px-4 text-sm font-semibold text-gray-700">
                My latest video
              </div>
              <div className="flex h-[46px] items-center rounded-[14px] bg-gray-100 px-4 text-sm font-semibold text-gray-700">
                Shop my picks
              </div>
              <div className="flex h-[46px] items-center rounded-[14px] bg-ink px-4 text-sm font-semibold text-white">
                Subscribe to newsletter
              </div>
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <span className="size-[34px] rounded-full bg-ink" />
              <span className="size-[34px] rounded-full bg-ink" />
              <span className="size-[34px] rounded-full bg-ink" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[34px] text-center text-sm font-semibold text-kale opacity-75">
          Join 70M+ creators sharing everything they are, in one link.
        </div>
      </section>
    </div>
  );
}
