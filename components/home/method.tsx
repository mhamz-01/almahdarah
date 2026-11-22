"use client";

import { methodSteps } from "@/lib/data/home-v2";
import { useScrollProgress } from "./use-scroll-progress";
import { ParticleField } from "./particle-field";

const N = methodSteps.length;

/** Pinned scene: scrolling steps through the four pillars of the method. */
export function Method() {
  const { ref, progress: p } = useScrollProgress<HTMLElement>();
  const active = Math.min(N - 1, Math.floor(p * N * 1.0001));

  return (
    <section
      id="method"
      ref={ref}
      className="relative h-[420vh] border-t border-border bg-surface"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,1fr)] items-center gap-[clamp(24px,5vw,64px)] px-7 pt-[72px] pb-6 md:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
          <div>
            <span className="font-mono text-xs tracking-[0.1em] text-primary">
              THE METHOD
            </span>
            <h2 className="mt-[clamp(10px,2vh,18px)] text-[min(clamp(30px,4.6vw,60px),7.5vh)] leading-[1.02] font-semibold tracking-[-0.04em] text-ink">
              An academic path.
              <br />
              Not a playlist.
            </h2>
            <p className="mt-[clamp(10px,2vh,20px)] hidden max-w-[40ch] text-[17px] leading-[1.6] text-text md:block">
              The way deen has always been learned — texts, teachers, levels,
              and time. Rebuilt for people with jobs.
            </p>
            <div className="mt-[clamp(14px,3.5vh,36px)] flex flex-row gap-2 md:flex-col md:gap-0.5">
              {methodSteps.map((s, i) => (
                <div
                  key={s.term}
                  className="grid flex-1 grid-cols-1 items-center gap-3 py-[min(12px,1.4vh)] md:flex-none md:grid-cols-[44px_1fr]"
                >
                  <span
                    className={`hidden font-mono text-xs transition-colors duration-300 md:block ${i === active ? "text-primary" : "text-muted"}`}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <div
                      className={`hidden text-[15px] font-semibold capitalize transition-colors duration-300 md:block ${i <= active ? "text-ink" : "text-muted"}`}
                    >
                      {s.term.toLowerCase()}
                    </div>
                    <div className="h-0.5 overflow-hidden rounded-sm bg-border md:mt-2">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${Math.round(Math.min(1, Math.max(0, p * N - i)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[clamp(250px,52vh,440px)]">
            {/* the drawing changes with the pillar: texts → chain → road → steps */}
            <div className="absolute inset-0 isolate overflow-hidden rounded-2xl border border-border bg-paper">
              <ParticleField
                formation={
                  (["book", "chain", "road", "steps"] as const)[active]
                }
                place={{ x: 0, y: 0.34, size: 0.62 }}
                count={900}
                opacity={0.75}
              />
            </div>
            {methodSteps.map((s, i) => (
              <div
                key={s.term}
                aria-hidden={i !== active}
                className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl p-[clamp(22px,3.5vw,44px)] transition-[opacity,transform] duration-[550ms] ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{
                  opacity: i === active ? 1 : 0,
                  transform:
                    i === active
                      ? "none"
                      : i < active
                        ? "translateY(-36px) scale(.97)"
                        : "translateY(36px) scale(.97)",
                  pointerEvents: i === active ? "auto" : "none",
                }}
              >
                <div
                  aria-hidden
                  className="ds-lattice absolute inset-0 [mask-image:radial-gradient(circle_at_85%_15%,#000_0%,transparent_60%)]"
                />
                <div className="relative flex items-start justify-between gap-4">
                  <span className="font-mono text-xs tracking-[0.1em] text-muted">
                    0{i + 1} / 0{N}
                  </span>
                  <span className="font-kufi text-[min(clamp(56px,8vw,104px),11vh)] leading-[0.9] text-accent">
                    {s.arabic}
                  </span>
                </div>
                <div className="relative">
                  <div className="font-mono text-xs tracking-[0.1em] text-primary">
                    0{i + 1} — {s.term}
                  </div>
                  <div className="mt-2.5 text-[min(clamp(24px,3vw,38px),5vh)] leading-[1.08] font-semibold tracking-[-0.03em] text-ink">
                    {s.title}
                  </div>
                  <p className="mt-3 max-w-[44ch] text-[clamp(15px,1.3vw,17px)] leading-[1.55] text-text">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
