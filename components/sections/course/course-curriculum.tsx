"use client";

import { useState } from "react";
import type { CourseModule } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { getCourseCounts } from "@/lib/course-copy";

interface CourseCurriculumProps {
  modules: CourseModule[];
  /** Free courses show a count-only summary instead of a per-module lesson breakdown. */
  summaryOnly?: boolean;
}

export function CourseCurriculum({ modules, summaryOnly = false }: CourseCurriculumProps) {
  const [openModules, setOpenModules] = useState<Record<number, boolean>>({ 0: true });
  const { moduleCountLine, lessonCountLine } = getCourseCounts({ modules });

  const toggle = (i: number) => {
    setOpenModules((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  if (summaryOnly) {
    return (
      <section id="curriculum" className="border-y border-border bg-surface-2">
        <div className="mx-auto max-w-[900px] px-7 py-16 sm:py-20 lg:py-[96px]">
          <Reveal>
            <SectionHeading
              eyebrow="Curriculum"
              eyebrowClassName="text-primary-2"
              eyebrowLineClassName="bg-primary-2"
              title="See exactly what's inside"
            />
          </Reveal>

          <Reveal delay={90}>
            <div className="mt-9 grid grid-cols-2 overflow-hidden rounded-[18px] border border-border bg-surface">
              <div className="flex flex-col items-center gap-1 border-r border-border px-6 py-8 text-center">
                <span className="font-display text-[38px] leading-none text-primary-2">{modules.length}</span>
                <span className="text-[13px] font-semibold text-muted">
                  {modules.length === 1 ? "Module" : "Modules"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 px-6 py-8 text-center">
                <span className="font-display text-[38px] leading-none text-primary-2">
                  {modules.reduce((total, mod) => total + mod.lessons.length, 0)}
                </span>
                <span className="text-[13px] font-semibold text-muted">
                  {modules.reduce((total, mod) => total + mod.lessons.length, 0) === 1 ? "Lesson" : "Lessons"}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="curriculum" className="border-y border-border bg-surface-2">
      <div className="mx-auto max-w-[900px] px-7 py-16 sm:py-20 lg:py-[96px]">
        <div className="flex flex-wrap items-end justify-between gap-3.5">
          <Reveal>
            <SectionHeading
              eyebrow="Curriculum"
              eyebrowClassName="text-primary-2"
              eyebrowLineClassName="bg-primary-2"
              title="See exactly what's inside"
            />
          </Reveal>
          <span className="text-[13px] font-semibold text-muted">
            {moduleCountLine} · {lessonCountLine}
          </span>
        </div>

        <div className="mt-9 flex flex-col gap-3">
          {modules.map((mod, i) => {
            const isOpen = !!openModules[i];
            return (
              <Reveal key={mod.title} delay={i * 60}>
                <div className="overflow-hidden rounded-[18px] border border-border bg-surface">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-[22px] py-5 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="w-8 shrink-0 font-display text-[15px] text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[15.5px] font-bold text-ink">{mod.title}</div>
                        <div className="mt-0.5 text-[12.5px] text-muted">{mod.meta}</div>
                      </div>
                    </div>
                    <span
                      className={`w-[22px] shrink-0 text-center text-xl font-semibold text-muted transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-2.5 px-[22px] pb-5 pl-[70px]">
                        {mod.lessons.map((lesson) => (
                          <div key={lesson} className="flex items-center gap-2.5 text-sm text-text">
                            <span className="h-1.5 w-1.5 rotate-45 bg-primary-2" />
                            {lesson}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
