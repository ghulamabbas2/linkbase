import type { ReactNode } from "react";

interface Reason {
  tile: string;
  title: string;
  body: string;
  icon: ReactNode;
}

const iconProps = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "var(--ink)",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const REASONS: Reason[] = [
  {
    tile: "bg-chartreuse",
    title: "One link for it all",
    body: "Point your whole audience to a single page that holds every link, product and profile you've got.",
    icon: (
      <svg {...iconProps}>
        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
        <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    tile: "bg-blush",
    title: "Live in two minutes",
    body: "Claim your username, drop in your links and share it anywhere. No code, no fuss, no website required.",
    icon: (
      <svg {...iconProps}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    tile: "bg-sage",
    title: "See what works",
    body: "Track clicks and views over time so you always know what your audience is really responding to.",
    icon: (
      <svg {...iconProps}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

// White reasons strip: three benefit tiles.
export function Reasons() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1120px] grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[clamp(28px,4vw,44px)] px-[clamp(20px,5vw,32px)] py-[clamp(56px,8vw,90px)]">
        {REASONS.map((reason) => (
          <div key={reason.title}>
            <div
              className={`mb-[18px] flex size-13 items-center justify-center rounded-2xl ${reason.tile}`}
            >
              {reason.icon}
            </div>
            <h3 className="mb-2 font-display text-[22px] font-black tracking-[-.01em]">
              {reason.title}
            </h3>
            <p className="text-[15px] leading-[1.55] text-gray-700">
              {reason.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
