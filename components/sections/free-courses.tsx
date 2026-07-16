import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { FreeCourseCard } from "@/components/cards/free-course-card";
import { freeCourses } from "@/lib/data/courses";

export function FreeCourses() {
  return (
    <section id="free" className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
      <div className="flex flex-wrap items-end justify-between gap-[18px]">
        <div className="max-w-[620px]">
          <Reveal>
            <SectionHeading
              eyebrow="Open & Free"
              eyebrowClassName="text-primary-2"
              eyebrowLineClassName="bg-primary-2"
              title="Start today — no fee"
            />
          </Reveal>
          <Reveal delay={90}>
            <p className="mt-3 text-[15.5px] text-text">
              Live weekly classes taught by our teachers, open to everyone. No
              fee, no commitment — just join the community.
            </p>
          </Reveal>
        </div>
        <Reveal delay={180}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[12.5px] font-bold text-green">
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-green" />
            </span>
            {freeCourses.length} free courses · no sign-up needed
          </span>
        </Reveal>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {freeCourses.map((course, i) => (
          <Reveal key={course.title} delay={i * 70}>
            <FreeCourseCard {...course} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
