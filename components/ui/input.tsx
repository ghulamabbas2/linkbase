import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: ReactNode;
  prefix?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

// Filled text field: soft-gray at rest, white with a green focus ring when
// active. Optional inline `prefix` (e.g. "linkbase.to/") and hint/error slot.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, prefix, hint, error, className = "", id, ...rest },
  ref,
) {
  const inputId =
    id ??
    (typeof label === "string"
      ? `lb-${label.replace(/\s+/g, "-").toLowerCase()}`
      : undefined);

  return (
    <label
      className={`flex w-full flex-col gap-1.5 font-sans ${className}`}
      htmlFor={inputId}
    >
      {label && (
        <span className="text-sm font-semibold text-ink">{label}</span>
      )}
      <span
        className={
          "flex h-13 w-full items-center gap-0.5 rounded-xl border px-4 " +
          "bg-gray-100 transition-[background-color,border-color,box-shadow] duration-150 " +
          "focus-within:bg-white focus-within:shadow-[var(--focus-ring)] " +
          (error
            ? "border-berry"
            : "border-transparent focus-within:border-gray-300")
        }
      >
        {prefix && (
          <span className="whitespace-nowrap text-base text-gray-500">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={
            "min-w-0 flex-1 border-none bg-transparent font-sans text-base " +
            "font-medium text-ink outline-none placeholder:font-normal placeholder:text-gray-400"
          }
          {...rest}
        />
      </span>
      {(error || hint) && (
        <span
          className={`text-xs ${error ? "text-berry" : "text-gray-500"}`}
        >
          {error || hint}
        </span>
      )}
    </label>
  );
});
