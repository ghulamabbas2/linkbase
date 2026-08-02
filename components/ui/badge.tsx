import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "white" | "dark" | "green" | "soft";
type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  leftIcon?: ReactNode;
  children: ReactNode;
}

const base =
  "inline-flex items-center gap-1.5 rounded-full font-sans font-semibold " +
  "whitespace-nowrap [&_svg]:size-[1em]";

const variants: Record<BadgeVariant, string> = {
  white: "bg-white text-ink shadow-sm",
  dark: "bg-ink text-white",
  green: "bg-green-bright text-green-ink",
  soft: "bg-gray-100 text-gray-600",
};

const sizes: Record<BadgeSize, string> = {
  sm: "h-6 px-2.5 text-xs",
  md: "h-[34px] px-4 text-sm",
};

export function Badge({
  variant = "soft",
  size = "md",
  leftIcon,
  children,
  className = "",
  ...rest
}: BadgeProps) {
  const classes = [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {leftIcon}
      {children}
    </span>
  );
}
