import Link from "next/link";
import type { CourseDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { StarRating } from "@/components/ui/star-rating";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
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

      <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-10 px-7 pt-6 pb-16 lg:grid-cols-2 lg:gap-16 lg:pb-[68px]">
        <div>
          <Reveal>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3.5 py-1.5 text-xs font-bold text-primary">
                {course.category}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-bold text-[#2b2a26]">
                {copy.badgeLabel}
              </span>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-[18px] text-[clamp(32px,4.6vw,58px)] leading-[0.98] font-display tracking-[-0.015em] text-ink uppercase text-balance">
              {course.title}
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="mt-[18px] max-w-[46ch] text-[clamp(15.5px,1.4vw,17.5px)] text-text">
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
                Taught by <strong className="text-ink">{course.teacherName}</strong> · {course.teacherRole}
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
          <div className="overflow-hidden rounded-[26px] border border-border bg-surface shadow-[var(--shadow-lg)]">
            <div
              className="relative flex h-[220px] items-center justify-center overflow-hidden"
              style={{ background: "linear-gradient(155deg, var(--primary) 0%, var(--primary-2) 100%)" }}
            >
              <div className="bg-pattern pointer-events-none absolute inset-0 opacity-40" />
              <button
                type="button"
                aria-label="Preview lesson"
                className="relative flex h-[66px] w-[66px] items-center justify-center rounded-full bg-white/95 shadow-[var(--shadow-md)] transition-transform duration-200 hover:scale-[1.06]"
              >
                <span className="ml-1 border-y-[12px] border-l-[20px] border-y-transparent border-l-primary" />
              </button>
              <span className="absolute bottom-3.5 left-4 text-xs font-semibold text-white/85">
                Watch a 90-second preview
              </span>
            </div>
            <div className="flex flex-col gap-3.5 p-6">
              <span className="text-[13px] font-bold text-ink">This course includes</span>
              <div className="grid grid-cols-2 gap-3">
                {[moduleCountLine, course.durationLine, copy.formatLine, copy.certLine].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="h-2 w-2 rotate-45 bg-primary" />
                    <span className="text-[13px] text-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -right-3 -bottom-4 flex items-center gap-2.5 rounded-[14px] border border-border bg-surface px-4 py-3 shadow-[var(--shadow-md)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green shadow-[0_0_0_4px_rgba(62,158,84,0.24)]" />
            </span>
            <span className="text-[12.5px] font-semibold text-fg">{copy.trustLine}</span>
          </div>
        </Reveal>
      </div>

      <div className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-3.5 px-7 py-[17px] text-center sm:grid-cols-4">
          <div>
            <div className="font-display text-[22px] text-ink">{course.statStudents}</div>
            <div className="text-xs text-muted">students taught</div>
          </div>
          <div>
            <div className="font-display text-[22px] text-ink">{course.rating}★</div>
            <div className="text-xs text-muted">average rating</div>
          </div>
          <div>
            <div className="font-display text-[22px] text-ink">{course.statCountries}</div>
            <div className="text-xs text-muted">countries reached</div>
          </div>
          <div>
            <div className="font-display text-[22px] text-ink">{course.statCompletion}</div>
            <div className="text-xs text-muted">finish what they start</div>
          </div>
        </div>
      </div>
    </section>
  );
}
