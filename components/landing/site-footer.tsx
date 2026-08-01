import { Wordmark } from "@/components/ui/wordmark";

const FOOTER_LINKS = ["About", "Pricing", "Help", "Privacy", "Terms"];

const socialIconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const SOCIALS = [
  {
    label: "Instagram",
    icon: (
      <svg {...socialIconProps}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    icon: (
      <svg {...socialIconProps}>
        <path d="M22 8.6a2.8 2.8 0 0 0-2-2C18.2 6 12 6 12 6s-6.2 0-8 .6a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.8 12 29 29 0 0 0 2 15.4a2.8 2.8 0 0 0 2 2c1.8.6 8 .6 8 .6s6.2 0 8-.6a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22.2 12 29 29 0 0 0 22 8.6z" />
        <polygon points="10 9.2 15 12 10 14.8 10 9.2" />
      </svg>
    ),
  },
  {
    label: "X",
    icon: (
      <svg {...socialIconProps}>
        <path d="M4 4l16 16M20 4L4 20" />
      </svg>
    ),
  },
];

// Ink footer: wordmark, link nav, social icons, and copyright.
export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-7 px-[clamp(20px,5vw,32px)] py-[clamp(44px,6vw,64px)]">
        <Wordmark accent="bright" className="text-2xl" />
        <nav className="flex flex-wrap gap-[22px] text-sm">
          {FOOTER_LINKS.map((label) => (
            <a key={label} href="#" className="text-white/70 hover:text-white">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex gap-4">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href="#"
              aria-label={social.label}
              rel="noopener noreferrer"
              className="text-white hover:opacity-60"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1120px] px-[clamp(20px,5vw,32px)] pb-[clamp(28px,4vw,40px)] text-[13px] text-white/50">
        © 2026 Linkbase. All rights reserved.
      </div>
    </footer>
  );
}
