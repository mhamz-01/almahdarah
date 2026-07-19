import Link from "next/link";
import type { CourseDetail, FacultyProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CoverPlaceholder } from "@/components/ui/cover-placeholder";
import { getFacultyBookingHref, getFacultyFirstName } from "@/lib/faculty-copy";

interface FacultyHeroProps {
  faculty: FacultyProfile;
  hasPaidCourse: boolean;
  primaryCourse?: CourseDetail;
}

export function FacultyHero({ faculty, hasPaidCourse, primaryCourse }: FacultyHeroProps) {
  const firstName = getFacultyFirstName(faculty.name);
  const bookingHref = getFacultyBookingHref(primaryCourse);

  return (
    <section className="relative overflow-hidden">
      <div
        className="bg-pattern pointer-events-none absolute inset-0 opacity-60"
        style={{
          WebkitMaskImage: "radial-gradient(120% 90% at 72% 8%, #000 30%, transparent 76%)",
          maskImage: "radial-gradient(120% 90% at 72% 8%, #000 30%, transparent 76%)",
        }}
      />

      <div className="relative mx-auto max-w-[1160px] px-7">
        <div className="flex flex-wrap items-center gap-2 pt-5 text-[13px] text-muted">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/#faculty" className="transition-colors hover:text-primary">
            Faculty
          </Link>
          <span>/</span>
          <span className="font-semibold text-ink">{faculty.name}</span>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-[1160px] grid-cols-1 items-start gap-9 px-7 pt-7 pb-16 sm:pb-20 md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-14">
        <Reveal className="flex flex-col gap-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] shadow-[var(--shadow-lg)]">
            <CoverPlaceholder accent={faculty.accent} className="h-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {faculty.credentials.map((credential) => (
              <span
                key={credential}
                className="rounded-full border border-border bg-surface px-3.5 py-[7px] text-xs font-bold text-text"
              >
                {credential}
              </span>
            ))}
          </div>
        </Reveal>

        <div>
          <Reveal delay={90}>
            <span className="inline-flex items-center gap-2.5 text-[12.5px] font-bold tracking-[0.2em] text-primary uppercase">
              <span className="h-0.5 w-[22px] bg-primary" />
              {faculty.department}
            </span>
            <h1 className="mt-3.5 font-display text-[clamp(32px,4.4vw,56px)] leading-[0.98] tracking-[-0.01em] text-ink uppercase">
              {faculty.name}
            </h1>
            <p className="mt-2 text-[17px] font-bold text-primary-2">{faculty.role}</p>
          </Reveal>

          <Reveal delay={150}>
            <p className="mt-5 max-w-[62ch] text-[15.5px] text-text">{faculty.bio}</p>
          </Reveal>

          <Reveal delay={270}>
            <div className="mt-[30px] flex flex-wrap gap-3">
              {bookingHref && (
                <Button href={bookingHref} size="lg" withArrow>
                  {hasPaidCourse ? `Book a free demo with ${firstName}` : `Start learning with ${firstName}`}
                </Button>
              )}
              <Button href="#courses-taught" variant="outline" size="lg">
                View courses taught
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
