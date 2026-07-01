import { SectionHeading } from "@/components/ui/section-heading";
import { FreeCourseCard } from "@/components/cards/free-course-card";
import { freeCourses } from "@/lib/data/courses";

export function FreeCourses() {
  return (
    <section id="free" className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
      <div className="flex flex-wrap items-end justify-between gap-[18px]">
        <div className="max-w-[620px]">
          <SectionHeading
            eyebrow="Open & Free"
            eyebrowClassName="text-primary-2"
            eyebrowLineClassName="bg-primary-2"
            title="Start today — no fee"
          />
          <p className="mt-3 text-[15.5px] text-text">
            Self-paced lessons open to everyone. No card, no commitment — just
            press play.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[12.5px] font-bold text-green">
          <span className="h-[7px] w-[7px] rounded-full bg-green" /> 9 free courses ·
          no sign-up needed
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {freeCourses.map((course) => (
          <FreeCourseCard key={course.title} {...course} />
        ))}
      </div>
    </section>
  );
}
