import Link from "next/link";

import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/wordmark";
import { auth } from "@/lib/auth";

import { HandleCtaForm } from "./handle-cta-form";

const PREVIEW_LINKS = ["Latest work", "Shop prints", "Instagram"];

// Chartreuse hero: nav, headline + username form, and a static product preview.
export async function LandingHero() {
  const session = await auth();

  return (
    <section className="bg-chartreuse">
      <nav className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-[clamp(20px,5vw,32px)] py-5">
        <Wordmark className="text-[26px] text-ink" />
        {session?.user ? (
          <UserMenu
            email={session.user.email ?? ""}
            handle={session.user.handle}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Button as={Link} href="/sign-in" variant="ghost" size="sm">
              Log in
            </Button>
            <Button as={Link} href="/sign-up" variant="primary" size="sm">
              Sign up free
            </Button>
          </div>
        )}
      </nav>

      <div className="mx-auto grid max-w-[1120px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-[clamp(32px,5vw,56px)] px-[clamp(20px,5vw,32px)] pt-[clamp(28px,5vw,48px)] pb-[clamp(56px,8vw,90px)]">
        <div className="text-left">
          <h1 className="m-0 font-display text-[clamp(40px,6vw,66px)] font-black leading-[1.02] tracking-tight text-ink">
            Everything you are. In one simple link.
          </h1>
          <p className="mt-5 mb-7 max-w-[460px] text-[clamp(17px,2vw,19px)] leading-[1.5] text-ink">
            One link to hold everything you make, share and sell — and one place
            to see what&apos;s actually working.
          </p>
          <HandleCtaForm buttonVariant="primary" />
          <p className="mt-3.5 text-[13px] text-gray-600">
            Free for your first month. No credit card needed.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-[clamp(240px,80%,290px)] rounded-[40px] bg-ink p-3 shadow-[0_24px_60px_rgba(0,0,0,.22)]">
            <div className="flex flex-col items-center gap-1.5 overflow-hidden rounded-[30px] bg-gray-100 px-[18px] pt-[26px] pb-[22px]">
              <div className="flex size-[74px] items-center justify-center rounded-full bg-grape font-display text-[30px] font-black text-white">
                A
              </div>
              <div className="mt-1.5 text-base font-bold">@gabbasdev</div>
              <div className="mb-3 text-xs text-gray-500">Designer &amp; maker</div>
              <div className="flex w-full flex-col gap-2.5">
                {PREVIEW_LINKS.slice(0, 2).map((label) => (
                  <PreviewRow key={label}>{label}</PreviewRow>
                ))}
                <div className="flex h-11 items-center justify-center rounded-[14px] bg-green text-sm font-semibold text-white">
                  Subscribe
                </div>
                <PreviewRow>{PREVIEW_LINKS[2]}</PreviewRow>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-11 items-center justify-center rounded-[14px] border border-gray-200 bg-white text-sm font-semibold shadow-[0_1px_2px_rgba(0,0,0,.04)]">
      {children}
    </div>
  );
}
