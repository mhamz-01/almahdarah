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
    <section className="relative isolate overflow-hidden bg-[#0E2A47]">
      <div
        aria-hidden
        className="absolute -top-[40%] -right-[10%] aspect-square w-[70%] rounded-full [mask-image:radial-gradient(circle,#000_30%,transparent_70%)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 1px,transparent 1px 48px),repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 1px,transparent 1px 48px)",
        }}
      />

      <div className="relative mx-auto max-w-[820px] px-7 py-[clamp(72px,10vw,128px)] text-center text-white">
        <Reveal>
          <h2 className="mx-auto max-w-[18ch] text-[clamp(32px,4.6vw,56px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance">
            {hasPaidCourse ? `Meet ${firstName} in a free demo class` : `Start learning with ${firstName} today`}
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[17px] leading-[1.6] text-[#B9C4CF]">
            {hasPaidCourse
              ? "No payment, no pressure — just a real class with a real teacher."
              : "Completely free to access — no card required, ever."}
          </p>
          {bookingHref && (
            <div className="mt-7">
              <Button href={bookingHref} variant="primary" size="lg" withArrow className="!bg-[#3BA6C6] !text-[#0B1622]">
                {hasPaidCourse ? "Book a free demo" : "Start free course"}
              </Button>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
