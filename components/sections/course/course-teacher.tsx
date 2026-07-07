import type { CourseDetail } from "@/lib/types";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { CoverPlaceholder } from "@/components/ui/cover-placeholder";

interface CourseTeacherProps {
  course: CourseDetail;
}

export function CourseTeacher({ course }: CourseTeacherProps) {
  return (
    <section id="teacher" className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[96px]">
      <Reveal>
        <Eyebrow className="text-green" lineClassName="bg-green">
          Your teacher
        </Eyebrow>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 items-center gap-9 lg:grid-cols-2 lg:gap-14">
        <Reveal delay={90} className="flex flex-col gap-4">
          <div className="h-[112px] w-[112px] overflow-hidden rounded-[26px] shadow-[var(--shadow-md)]">
            <CoverPlaceholder accent={course.accent} className="h-full" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-ink">{course.teacherName}</h3>
            <p className="mt-1 text-sm font-bold text-primary-2">{course.teacherRole}</p>
          </div>
          <p className="max-w-[52ch] text-[15px] text-text">{course.teacherBio}</p>
          <div className="flex flex-wrap gap-2.5">
            <span className="rounded-full bg-mint px-3.5 py-1.5 text-[12.5px] font-bold text-primary-2">
              Ijāzah in recitation
            </span>
            <span className="rounded-full border border-border bg-surface-2 px-3.5 py-1.5 text-[12.5px] font-bold text-text">
              10+ years teaching
            </span>
            <span className="rounded-full border border-border bg-surface-2 px-3.5 py-1.5 text-[12.5px] font-bold text-text">
              {course.studentsLine}
            </span>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="relative overflow-hidden rounded-3xl bg-navy p-7 text-white sm:p-9">
            <span className="text-base tracking-[2px] text-gold">★★★★★</span>
            <p className="relative mt-3.5 font-serif text-[clamp(18px,1.9vw,22px)] leading-[1.5] font-medium italic">
              &ldquo;{course.teacherQuote}&rdquo;
            </p>
            <div className="relative mt-[18px] text-[13px] text-white/75">— {course.teacherName}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
