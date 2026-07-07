import Link from "next/link";
import type { CourseDetail } from "@/lib/types";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { DiamondMark } from "@/components/ui/diamond-mark";
import { accentBg, accentBorder, accentSoftBg, accentText } from "@/lib/accent";

interface FacultyCoursesProps {
  courses: CourseDetail[];
  firstName: string;
}

export function FacultyCourses({ courses, firstName }: FacultyCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <section id="courses-taught" className="mx-auto max-w-[1160px] px-7 py-16 sm:py-20 lg:py-[92px]">
      <Reveal>
        <Eyebrow className="text-primary" lineClassName="bg-primary">
          Courses taught
        </Eyebrow>
        <h2 className="mt-3.5 font-display text-[clamp(24px,2.8vw,36px)] leading-none tracking-[-0.01em] text-ink uppercase">
          Learn directly with {firstName}
        </h2>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, i) => (
          <Reveal key={course.slug} delay={i * 80}>
            <Link
              href={`/courses/${course.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-border bg-surface shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <span className={`absolute inset-x-0 top-0 h-[5px] ${accentBg[course.accent]}`} />
              <div className={`flex h-[120px] items-center justify-between p-[18px] ${accentSoftBg[course.accent]}`}>
                <DiamondMark className="h-8 w-8" colorClassName={accentBorder[course.accent]} />
                <span
                  className={`rounded-full px-3 py-[5px] text-[11px] font-bold ${
                    course.type === "paid" ? "bg-gold text-[#2b2a26]" : "bg-green text-white"
                  }`}
                >
                  {course.type === "paid" ? "Mentored" : "Free"}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-[17px] font-bold text-ink">{course.title}</h3>
                <p className="flex-1 text-[13.5px] text-text">{course.subtitle}</p>
                <span className={`mt-1.5 text-[13px] font-bold ${accentText[course.accent]}`}>
                  {course.type === "paid" ? "Book a free demo" : "Start free"} →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
