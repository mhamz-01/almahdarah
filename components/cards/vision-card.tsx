import type { VisionPillar } from "@/lib/types";
import { accentSoftBg, accentText } from "@/lib/accent";

export function VisionCard({ number, title, description, accent }: VisionPillar) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-7 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <span
        className={`flex h-[46px] w-[46px] items-center justify-center rounded-2xl font-display text-lg ${accentSoftBg[accent]} ${accentText[accent]}`}
      >
        {number}
      </span>
      <h3 className="mt-[18px] mb-2 text-lg font-bold text-ink">{title}</h3>
      <p className="text-[14.5px] text-text">{description}</p>
    </div>
  );
}
