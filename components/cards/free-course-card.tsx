import type { FreeCourse } from "@/lib/types";
import { accentSoftBg, accentText } from "@/lib/accent";

export function FreeCourseCard({ glyph, title, description, duration, accent }: FreeCourse) {
  return (
    <a
      href="#free"
      className="group relative flex flex-col gap-3 overflow-hidden rounded-[20px] border border-border bg-surface p-[26px] shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-2 -bottom-[22px] text-[96px] leading-none opacity-[0.08] ${accentText[accent]}`}
      >
        {glyph}
      </span>

      <div className="flex items-start justify-between">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl font-display text-xl ${accentSoftBg[accent]} ${accentText[accent]}`}
        >
          {glyph}
        </span>
        <span className="rounded-full bg-green px-[11px] py-[5px] text-[11px] font-bold text-white">
          FREE
        </span>
      </div>

      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="flex-1 text-[13.5px] text-text">{description}</p>

      <div className="mt-0.5 flex items-center justify-between border-t border-border pt-3.5">
        <span className="text-xs text-muted">{duration}</span>
        <span className={`inline-flex items-center gap-1.5 text-[13px] font-bold ${accentText[accent]}`}>
          Start free →
        </span>
      </div>
    </a>
  );
}
