type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  // Falls back to the first initial of `name` when no image is provided.
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizes: Record<AvatarSize, string> = {
  xs: "size-8 text-[13px]",
  sm: "size-11 text-base",
  md: "size-16 text-[22px]",
  lg: "size-24 text-[34px]",
  xl: "size-32 text-[46px]",
};

export function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "";
  const classes = [
    "inline-flex flex-none items-center justify-center overflow-hidden rounded-full",
    "bg-gray-300 font-sans font-bold text-gray-500 select-none",
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-hidden={!alt || undefined}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar may be an arbitrary external URL, not a Next-optimizable asset
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : initial ? (
        initial
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-[60%]" aria-hidden>
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
        </svg>
      )}
    </span>
  );
}
