import type { CourseDetail } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CheckGlyph } from "@/components/ui/check-glyph";

interface CourseOutcomesProps {
  outcomes: CourseDetail["outcomes"];
}

export function CourseOutcomes({ outcomes }: CourseOutcomesProps) {
  return (
    <section id="outcomes" className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[96px]">
      <div className="max-w-[640px]">
        <Reveal>
          <SectionHeading eyebrow="What you'll learn" title="Real outcomes, not just video hours" />
        </Reveal>
      </div>
      <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {outcomes.map((item, i) => (
          <Reveal key={item} delay={i * 60}>
            <div className="flex h-full items-start gap-3 rounded-[18px] border border-border bg-surface p-5 transition-shadow duration-200 hover:shadow-[var(--shadow-sm)]">
              <CheckGlyph className="mt-0.5" />
              <p className="text-[14.5px] leading-[1.5] text-text">{item}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
