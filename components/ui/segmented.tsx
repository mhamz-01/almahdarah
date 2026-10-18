"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  key: T;
  label: React.ReactNode;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (key: T) => void;
  ariaLabel: string;
  /** The outer pill (background, border, padding, width). */
  className?: string;
  /** The sliding highlight behind the selected option. */
  thumbClass: string;
  /** Text colour of the selected / other options. */
  activeClass: string;
  idleClass?: string;
  /** Applied to every option button (height, text size). */
  buttonClass?: string;
  /** Extra attributes per option, e.g. ids for aria-controls. */
  optionProps?: (key: T) => React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/** A tab switch whose highlight glides to the chosen option instead of snapping. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  thumbClass,
  activeClass,
  idleClass = "text-muted hover:text-ink",
  buttonClass,
  optionProps,
}: SegmentedProps<T>) {
  const count = options.length;
  const index = Math.max(0, options.findIndex((o) => o.key === value));

  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("rounded-full", className)}>
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            thumbClass,
          )}
          style={{ width: `${100 / count}%`, transform: `translateX(${index * 100}%)` }}
        />
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={o.key === value}
            onClick={() => onChange(o.key)}
            className={cn(
              "relative rounded-full px-4 font-bold whitespace-nowrap transition-colors duration-300",
              o.key === value ? activeClass : idleClass,
              buttonClass,
            )}
            {...optionProps?.(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
