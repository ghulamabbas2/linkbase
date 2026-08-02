import type { ChangeEventHandler } from "react";

interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  // Accessible name for the switch (rendered as the input's aria-label).
  label: string;
  className?: string;
}

// Pill switch — green when on. Wraps a visually-hidden native checkbox so
// keyboard + form semantics stay intact (docs/ui.md).
export function Toggle({
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  className = "",
}: ToggleProps) {
  return (
    <label
      className={`relative inline-flex h-7 w-12 flex-none cursor-pointer items-center ${
        disabled ? "cursor-not-allowed opacity-40" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
      />
      <span
        className={
          "absolute inset-0 rounded-full bg-gray-300 transition-colors duration-200 " +
          "peer-checked:bg-green peer-focus-visible:shadow-[var(--focus-ring)]"
        }
      />
      <span
        className={
          "absolute left-[3px] size-[22px] rounded-full bg-white shadow-sm " +
          "transition-transform duration-200 peer-checked:translate-x-5 " +
          "motion-reduce:transition-none"
        }
      />
    </label>
  );
}
