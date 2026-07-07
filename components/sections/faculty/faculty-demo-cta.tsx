import Image from "next/image";
import type { CourseDetail, FacultyProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getFacultyBookingHref, getFacultyFirstName } from "@/lib/faculty-copy";

interface FacultyDemoCtaProps {
  faculty: FacultyProfile;
  hasPaidCourse: boolean;
  primaryCourse?: CourseDetail;
}

export function FacultyDemoCta({ faculty, hasPaidCourse, primaryCourse }: FacultyDemoCtaProps) {
  const firstName = getFacultyFirstName(faculty.name);
  const bookingHref = getFacultyBookingHref(primaryCourse);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, var(--primary) 0%, var(--primary-2) 100%)" }}
    >
      <div className="bg-pattern pointer-events-none absolute inset-0 opacity-50" />
      <Image
        src="/assets/almahdrah-logo.png"
        alt=""
        width={280}
        height={280}
        loading="lazy"
        className="pointer-events-none absolute -right-10 -bottom-[50px] w-[280px] opacity-10 invert"
      />

      <div className="relative mx-auto max-w-[820px] px-7 py-16 text-center text-white sm:py-20 lg:py-[92px]">
        <Reveal>
          <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(26px,3.6vw,42px)] leading-[1.02] tracking-[-0.01em] uppercase">
            {hasPaidCourse ? `Meet ${firstName} in a free demo class` : `Start learning with ${firstName} today`}
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[15.5px] opacity-[0.94]">
            {hasPaidCourse
              ? "No payment, no pressure — just a real class with a real teacher."
              : "Completely free to access — no card required, ever."}
          </p>
          {bookingHref && (
            <div className="mt-7">
              <Button href={bookingHref} variant="gold" size="lg" withArrow>
                {hasPaidCourse ? "Book a free demo" : "Start free course"}
              </Button>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
