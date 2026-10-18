"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface OptionSelectProps {
  /** "" means "nothing chosen" and shows `emptyLabel`. */
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Adds a "nothing chosen" entry to the list with this label (e.g. "Not planned"). */
  emptyLabel?: string;
  /** Shown in the trigger while nothing is chosen and there is no `emptyLabel` entry. */
  placeholder?: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

// Radix reserves "" for "clear the selection", so the empty choice travels as a sentinel.
const EMPTY = "__empty__";

/** Compact pill dropdown built on the shared shadcn Select, used across the student task screens. */
export function OptionSelect({ value, onChange, options, emptyLabel, placeholder, ariaLabel, disabled, className }: OptionSelectProps) {
  return (
    <Select value={value === "" ? (emptyLabel ? EMPTY : "") : value} onValueChange={(v) => onChange(v === EMPTY ? "" : v)} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn("h-8 w-full gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold", className)}
      >
        <SelectValue placeholder={placeholder ?? emptyLabel} />
      </SelectTrigger>
      {/* z-index sits above the task drawer (z-100) so the list is never hidden behind it */}
      <SelectContent align="start" className="z-[200] max-h-[min(320px,var(--radix-select-content-available-height))]">
        {emptyLabel && (
          <SelectItem value={EMPTY} className="py-2 text-[13px] text-muted">
            {emptyLabel}
          </SelectItem>
        )}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="py-2 text-[13px]">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
