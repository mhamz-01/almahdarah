"use client";

import { useState } from "react";
import type { CourseFaq } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

interface CourseFaqProps {
  faqs: CourseFaq[];
}

export function CourseFaqSection({ faqs }: CourseFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-[820px] px-7 py-16 sm:py-20 lg:py-[96px]">
      <Reveal>
        <SectionHeading
          eyebrow="Common questions"
          eyebrowClassName="text-muted"
          eyebrowLineClassName="bg-muted"
          title="Before you begin"
        />
      </Reveal>

      <div className="mt-8 flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <Reveal key={faq.q} delay={i * 50}>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left"
                >
                  <span className="text-[15px] font-bold text-ink">{faq.q}</span>
                  <span
                    className={`w-5 shrink-0 text-center text-xl font-semibold text-muted transition-transform duration-300 ${
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
                    <p className="px-5 pb-[18px] text-[14.5px] leading-[1.6] text-text">{faq.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
