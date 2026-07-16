import Link from "next/link";
import type { FreeCourse } from "@/lib/types";
import { accentBg, accentSoftBg, accentText } from "@/lib/accent";
import { JoinCommunityDialog } from "@/components/community/join-community-dialog";

export function FreeCourseCard({
  slug,
  glyph,
  title,
  description,
  duration,
  schedule,
  accent,
  live = true,
}: FreeCourse) {
  return (
    <div className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-[20px] border border-border bg-surface p-[26px] shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
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

      <Link href={`/courses/${slug}`} className="w-fit">
        <h3 className="text-lg font-bold text-ink transition-colors group-hover:text-primary">
          {title}
        </h3>
      </Link>
      <p className="flex-1 text-[13.5px] text-text">{description}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border pt-3.5 text-xs text-muted">
        {live ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-green">
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-green" />
            </span>
            {schedule}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-semibold text-muted">
            <span className="h-[7px] w-[7px] rounded-full bg-border-strong" />
            {schedule}
          </span>
        )}
        <span className="text-border-strong">·</span>
        <span>{duration}</span>
      </div>

      <div className="mt-1 flex items-center gap-2.5">
        <Link
          href={`/courses/${slug}`}
          className={`inline-flex h-10 flex-1 items-center justify-center rounded-full text-[12.5px] font-bold text-white transition-transform duration-200 hover:brightness-[1.07] ${accentBg[accent]}`}
        >
          Start learning
        </Link>
        <JoinCommunityDialog courseTitle={title}>
          <button
            type="button"
            className="inline-flex h-10 flex-1 items-center justify-center gap-[7px] rounded-full border-[1.5px] border-border-strong text-[12.5px] font-bold text-fg transition-colors duration-200 hover:border-primary hover:text-primary"
          >
            Join community
          </button>
        </JoinCommunityDialog>
      </div>
    </div>
  );
}
