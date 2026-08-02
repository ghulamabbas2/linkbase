import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant = "soft" | "solid" | "white" | "ghost";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  // Required for a11y — icon-only controls must always be labelled.
  label: string;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center rounded-full border border-transparent " +
  "cursor-pointer select-none transition-[background-color,color,transform] duration-150 " +
  "active:scale-[.94] disabled:opacity-40 disabled:cursor-not-allowed " +
  "motion-reduce:transition-none motion-reduce:active:scale-100";

const variants: Record<IconButtonVariant, string> = {
  soft: "bg-gray-100 text-ink hover:not-disabled:bg-gray-200",
  solid: "bg-ink text-white hover:not-disabled:bg-gray-700",
  white: "bg-white text-ink shadow-sm hover:not-disabled:bg-gray-50",
  ghost: "bg-transparent text-gray-500 hover:not-disabled:bg-gray-100 hover:not-disabled:text-ink",
};

const sizes: Record<IconButtonSize, string> = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-11 [&_svg]:size-5",
  lg: "size-13 [&_svg]:size-[22px]",
};

export function IconButton({
  variant = "soft",
  size = "md",
  label,
  children,
  className = "",
  ...rest
}: IconButtonProps) {
  const classes = [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" aria-label={label} className={classes} {...rest}>
      {children}
    </button>
  );
}
