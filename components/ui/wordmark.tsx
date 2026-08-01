interface WordmarkProps {
  /** Accent color for the "base" syllable. */
  accent?: "green" | "bright";
  className?: string;
}

// The Linkbase type wordmark (no logo file ships). "base" carries the brand
// green — `green` on light surfaces, `bright` (#43e660) on dark ones.
export function Wordmark({ accent = "green", className = "" }: WordmarkProps) {
  return (
    <span className={`font-display font-black tracking-tight ${className}`}>
      Link<span className={accent === "bright" ? "text-green-bright" : "text-green"}>base</span>
    </span>
  );
}
