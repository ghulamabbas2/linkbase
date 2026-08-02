interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onSelect?: (id: string) => void;
  className?: string;
}

// Underline tab bar. Panel wiring (role="tabpanel"/aria-labelledby) is the
// caller's responsibility (docs/ui.md).
export function Tabs({ tabs, active, onSelect, className = "" }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`flex gap-6 border-b border-gray-200 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect?.(tab.id)}
            className={
              "relative -mb-px cursor-pointer pb-3 font-sans text-lg font-semibold " +
              "transition-colors duration-150 " +
              (isActive
                ? "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink"
                : "text-gray-400 hover:text-gray-600")
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
