"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { programmeArabic, programmeStyles } from "@/lib/data/home-v2";
import type { MentoredCourse } from "@/lib/types";
import { Tilt } from "./tilt";

/** Mentored programme cards: four colour treatments cycled over the course list, with hover motion. */
export function Programmes({ courses }: { courses: MentoredCourse[] }) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[repeat(2,minmax(0,1fr))]">
      {courses.map((c, i) => {
        const s = programmeStyles[i % programmeStyles.length];
        const h = hover === i;
        return (
          <Reveal key={c.slug} delay={(i % 2) * 120}>
            <Link
              href={`/courses/${c.slug}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="block transition-transform duration-[350ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1.5"
            >
              <Tilt
                className="relative flex aspect-[16/10] min-h-[240px] w-full flex-col justify-between overflow-hidden rounded-[14px] p-[clamp(20px,3vw,32px)] transition-shadow duration-[350ms] will-change-transform"
                style={{
                  background: s.bg,
                  boxShadow: h
                    ? "0 30px 60px -30px rgba(14,42,71,.55)"
                    : "0 0 0 0 rgba(0,0,0,0)",
                }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 [mask-image:radial-gradient(circle_at_0%_0%,#000_0%,transparent_70%)]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg,${s.pat} 0 1px,transparent 1px 36px),repeating-linear-gradient(-45deg,${s.pat} 0 1px,transparent 1px 36px)`,
                  }}
                />
                <div
                  aria-hidden
                  className="absolute transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                  style={{
                    right: s.shape.right,
                    bottom: s.shape.bottom,
                    width: s.shape.size,
                    height: s.shape.size,
                    borderRadius: s.shape.radius,
                    background: s.shape.bg,
                    border: s.shape.border,
                    transform: h ? s.shape.hover : s.shape.rest,
                  }}
                />

                <div className="relative flex items-center justify-between gap-3">
                  <span
                    className="font-mono text-[11.5px] tracking-[0.1em] uppercase"
                    style={{ color: s.meta }}
                  >
                    {c.index} · {c.category}
                  </span>
                  {c.popular && (
                    <span
                      className="rounded-full border px-[11px] py-[5px] font-mono text-[10.5px] tracking-[0.1em] whitespace-nowrap"
                      style={{ color: s.fg, borderColor: s.meta }}
                    >
                      POPULAR
                    </span>
                  )}
                </div>

                <div
                  dir="rtl"
                  className="relative self-start font-kufi text-[clamp(30px,4vw,56px)] leading-[1.1] transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                  style={{
                    color: s.ar,
                    transform: h ? "translateX(8px) scale(1.05)" : "none",
                  }}
                >
                  {programmeArabic[c.slug] ?? "علم"}
                </div>

                <div className="relative flex items-end justify-between gap-4">
                  <div>
                    <div
                      className="max-w-[10ch] text-[clamp(28px,3.6vw,46px)] leading-[0.98] font-extrabold tracking-[-0.04em]"
                      style={{ color: s.fg }}
                    >
                      {c.title}
                    </div>
                    <div
                      className="mt-3 text-[13px] font-semibold"
                      style={{ color: s.meta }}
                    >
                      {c.meta.join(" · ")}
                    </div>
                  </div>
                  <span
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-base transition-all duration-[350ms] ease-[cubic-bezier(.2,.8,.2,1)]"
                    style={{
                      background: s.fg,
                      color: s.bg,
                      opacity: h ? 1 : 0,
                      transform: h ? "none" : "translate(-6px,6px)",
                    }}
                  >
                    ↗
                  </span>
                </div>
              </Tilt>
              <p className="px-1 pt-[18px] text-[15px] leading-[1.55] text-text">
                {c.description}
              </p>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
