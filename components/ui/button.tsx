import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "green"
  | "outline"
  | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

// Polymorphic: renders a <button> by default, or any element/component passed
// via `as` (e.g. `as={Link}`), forwarding that element's native props.
type ButtonProps<T extends ElementType> = ButtonOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps | "as">;

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-semibold leading-none " +
  "rounded-full border border-transparent whitespace-nowrap cursor-pointer select-none " +
  "transition-[background-color,color,transform,border-color] duration-150 " +
  "active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none " +
  "motion-reduce:transition-none motion-reduce:active:scale-100";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-black text-white hover:not-disabled:bg-gray-700",
  secondary: "bg-gray-100 text-ink hover:not-disabled:bg-gray-200",
  green: "bg-green text-white hover:not-disabled:bg-kale",
  outline:
    "bg-white text-ink border-gray-300 hover:not-disabled:bg-gray-50",
  ghost: "bg-transparent text-ink hover:not-disabled:bg-gray-100",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-14 px-7 text-lg",
};

const iconWrap = "inline-flex items-center [&_svg]:size-[1.1em] [&_svg]:block";

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  ...rest
}: ButtonProps<T>) {
  const Component = as ?? "button";
  const classes = [
    base,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {leftIcon && <span className={iconWrap}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={iconWrap}>{rightIcon}</span>}
    </Component>
  );
}
