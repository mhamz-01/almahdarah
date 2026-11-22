import Link from "next/link";
import type { CourseDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { StarRating } from "@/components/ui/star-rating";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { DiamondMark } from "@/components/ui/diamond-mark";
import { JoinCommunityDialog } from "@/components/community/join-community-dialog";
import { getBookingHref, getCourseCopy, getCourseCounts } from "@/lib/course-copy";

interface CourseHeroProps {
  course: CourseDetail;
}

export function CourseHero({ course }: CourseHeroProps) {
  const copy = getCourseCopy(course.type);
  const { moduleCountLine } = getCourseCounts(course);
  
  return (
    <section className="relative overflow-hidden">
      <div
        className="bg-pattern pointer-events-none absolute inset-0 opacity-70"
        style={{
          WebkitMaskImage: "radial-gradient(120% 90% at 72% 8%, #000 30%, transparent 76%)",
          maskImage: "radial-gradient(120% 90% at 72% 8%, #000 30%, transparent 76%)",
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-7 pt-6">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href={copy.coursesAnchor} className="transition-colors hover:text-primary">
            Courses
          </Link>
          <span>/</span>
          <span className="font-semibold text-ink">{course.title}</span>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-10 px-7 pt-8 pb-16 lg:grid-cols-2 lg:gap-16 lg:pb-[68px]">
        <div>
          <Reveal>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3.5 py-1.5 font-mono text-[11.5px] tracking-[0.06em] text-primary">
                {course.category}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3.5 py-1.5 font-mono text-[11.5px] tracking-[0.06em] text-ink">
                {copy.badgeLabel}
              </span>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-5 text-[clamp(36px,5vw,66px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-ink">
              {course.title}
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="mt-5 max-w-[46ch] text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-text">
              {course.subtitle}
            </p>
          </Reveal>

          <Reveal delay={210}>
            <div className="mt-[22px] flex flex-wrap items-center gap-[18px]">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                <StarRating className="text-gold" /> {course.rating}
              </span>
              <span className="text-[13.5px] text-muted">{course.studentsLine}</span>
              <span className="text-[13.5px] text-muted">{course.levelLine}</span>
            </div>
          </Reveal>

          <Reveal delay={270}>
            <div className="mt-5 flex items-center gap-2.5">
              <AvatarPlaceholder accent={course.accent} size={34} className="border-2 border-surface shadow-[var(--shadow-sm)]" />
              <span className="text-[13.5px] text-text">
                Taught live by a dedicated <strong className="text-ink">{course.teacherRole}</strong>
              </span>
            </div>
          </Reveal>

          <Reveal delay={330}>
            <div className="mt-[30px] flex flex-wrap gap-3">
              {copy.isPaid ? (
                <Button href={getBookingHref(course)} size="lg" withArrow>
                  {copy.heroCtaLabel}
                </Button>
              ) : (
                <JoinCommunityDialog courseTitle={course.title}>
                  <Button size="lg" withArrow>
                    {copy.heroCtaLabel}
                  </Button>
                </JoinCommunityDialog>
              )}
              <Button href="#curriculum" variant="outline" size="lg">
                {copy.heroCtaSecondary}
              </Button>
            </div>
            <p className="mt-3.5 text-[13px] text-muted">{copy.priceLine}</p>
          </Reveal>
        </div>

        <Reveal delay={220} className="relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-md)]">
            <div
              className="relative flex min-h-[220px] flex-col justify-center overflow-hidden px-7 py-8"
              style={{ background: "#0E2A47" }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-[30%] -right-[20%] aspect-square w-[80%] rounded-full [mask-image:radial-gradient(circle,#000_30%,transparent_70%)]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg,rgba(255,255,255,.07) 0 1px,transparent 1px 40px),repeating-linear-gradient(-45deg,rgba(255,255,255,.07) 0 1px,transparent 1px 40px)",
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-4 left-5 font-serif text-[92px] leading-none text-white/15"
              >
                &ldquo;
              </span>
              <DiamondMark className="relative h-7 w-7" colorClassName="border-white/70" />
              <p className="relative mt-4 max-w-[36ch] font-serif text-[clamp(17px,1.7vw,21px)] leading-[1.5] text-white italic">
                &ldquo;{course.heroQuote}&rdquo;
              </p>
              <span className="relative mt-4 font-mono text-[11px] tracking-[0.1em] text-[#C9A24A] uppercase">
                {course.heroQuoteSource}
              </span>
            </div>
            <div className="flex flex-col gap-3.5 p-6">
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted">THIS COURSE INCLUDES</span>
              <div className="grid grid-cols-2 gap-3">
                {[moduleCountLine, course.durationLine, course.formatLine ?? copy.formatLine, copy.certLine].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rotate-45 bg-primary" />
                    <span className="text-[13px] text-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -right-3 -bottom-4 flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-md)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green shadow-[0_0_0_4px_rgba(62,158,84,0.24)]" />
            </span>
            <span className="text-[12.5px] font-semibold text-fg">{copy.trustLine}</span>
          </div>
        </Reveal>
      </div>

      <div className="border-y border-border bg-surface">
        <div
          className="mx-auto grid max-w-[1240px] gap-3.5 px-7 py-[17px] text-center"
          style={{
            gridTemplateColumns: `repeat(${2 + (course.statCountries ? 1 : 0) + (course.statCompletion ? 1 : 0)}, minmax(0, 1fr))`,
          }}
        >
          <div>
            <div className="text-[26px] leading-none font-semibold tracking-[-0.04em] text-ink">{course.statStudents}</div>
            <div className="text-xs text-muted">students taught</div>
          </div>
          <div>
            <div className="text-[26px] leading-none font-semibold tracking-[-0.04em] text-ink">{course.rating}★</div>
            <div className="text-xs text-muted">average rating</div>
          </div>
          {course.statCountries && (
            <div>
              <div className="text-[26px] leading-none font-semibold tracking-[-0.04em] text-ink">{course.statCountries}</div>
              <div className="text-xs text-muted">countries reached</div>
            </div>
          )}
          {course.statCompletion && (
            <div>
              <div className="text-[26px] leading-none font-semibold tracking-[-0.04em] text-ink">{course.statCompletion}</div>
              <div className="text-xs text-muted">finish what they start</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
