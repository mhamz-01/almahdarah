"use client";

import { useState } from "react";
import { KIND_LABEL, type Reflection } from "@/lib/data/reflections";

export function DailyReflection({ items }: { items: Reflection[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];
  if (!current) return null;

  return (
    <div className="rounded-[22px] border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Reminder type" className="flex gap-1 rounded-full bg-bg p-1">
          {items.map((item, i) => (
            <button
              key={item.kind}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`h-8 rounded-full px-4 text-[12px] font-bold transition-colors ${
                i === active ? "bg-ink text-bg" : "text-muted hover:text-ink"
              }`}
            >
              {KIND_LABEL[item.kind]}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">Today&apos;s reminder</span>
      </div>
      <p className="mt-5 max-w-[60ch] font-serif text-[19px] leading-[1.6] text-ink sm:text-[21px]">
        {current.text}
      </p>
      <p className="mt-3 font-mono text-[11px] text-muted">— {current.source}</p>
    </div>
  );
}
