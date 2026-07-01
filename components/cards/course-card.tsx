import type { MentoredCourse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DiamondMark } from "@/components/ui/diamond-mark";
import { accentBg, accentBorder, accentBorderSoft, accentSoftBg, accentText } from "@/lib/accent";

export function CourseCard({
  index,
  category,
  title,
  description,
  meta,
  accent,
  popular,
}: MentoredCourse) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-3xl bg-surface shadow-[var(--shadow-sm)] transition-transform duration-200 hover:-translate-y-1.5 ${
        popular ? `border-[1.5px] ${accentBorderSoft[accent]}` : "border border-border"
      }`}
    >
      <span className={`absolute inset-x-0 top-0 h-[5px] ${accentBg[accent]}`} />

      <div
        className={`relative flex h-[156px] items-start justify-between overflow-hidden p-5 ${accentSoftBg[accent]}`}
      >
        <span
          className={`pointer-events-none absolute -right-2 -bottom-[30px] font-display text-[120px] leading-none opacity-[0.16] ${accentText[accent]}`}
        >
          {index}
        </span>
        <DiamondMark colorClassName={accentBorder[accent]} />
        {popular ? (
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold text-[#2b2a26]">
            ★ Most popular
          </span>
        ) : (
          <span
            className={`relative inline-flex items-center rounded-full border border-border bg-surface px-3.5 py-1.5 text-[11px] font-bold ${accentText[accent]}`}
          >
            Mentored
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <span
            className={`font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase ${accentText[accent]}`}
          >
            {category}
          </span>
          <h3 className="mt-1 text-xl font-bold text-ink">{title}</h3>
        </div>
        <p className="flex-1 text-sm text-text">{description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] font-semibold text-muted">
          {meta.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rotate-45 ${accentBg[accent]}`} />
              {item}
            </span>
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="leading-tight">
            <div className="text-[13px] font-bold text-ink">Free demo class</div>
            <div className="text-[11.5px] text-muted">then off-platform</div>
          </div>
          <Button href="#demo" size="md" withArrow>
            Book demo
          </Button>
        </div>
      </div>
    </div>
  );
}
