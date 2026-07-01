import { SectionHeading } from "@/components/ui/section-heading";
import { CourseCard } from "@/components/cards/course-card";
import { mentoredCourses } from "@/lib/data/courses";

export function PaidCourses() {
  return (
    <section
      id="courses"
      className="border-y border-border bg-surface-2"
    >
      <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
        <div className="flex flex-wrap items-end justify-between gap-[18px]">
          <div className="max-w-[600px]">
            <SectionHeading
              eyebrow="Mentored Programs"
              title={
                <>
                  Guided courses
                  <br />
                  with a teacher
                </>
              }
            />
            <p className="mt-3 text-[15.5px] text-text">
              Start with a free demo class. If it&apos;s the right fit, tuition is
              arranged directly with your teacher — never processed on the
              platform.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[12.5px] font-bold text-primary-2">
            <span className="h-[7px] w-[7px] rounded-full bg-gold" /> Free demo · then
            off-platform
          </span>
        </div>

        <div className="mt-[42px] grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
          {mentoredCourses.map((course) => (
            <CourseCard key={course.index} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
}
