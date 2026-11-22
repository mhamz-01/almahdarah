"use client";

import type { CSSProperties } from "react";
import { tensionText } from "@/lib/data/home-v2";
import { useScrollProgress } from "./use-scroll-progress";
import { ParticleField } from "./particle-field";

/**
 * Pinned reading scene. Problem → agitation → turn. The paragraph "reads itself" as you scroll,
 * the turn ("But…") switches to the brand colour, and the resolution — a path forward — appears
 * only once the reader has finished, so the call to action lands at the moment of relief.
 */
export function Tension() {
  const { ref, progress } = useScrollProgress<HTMLElement>();

  const words = tensionText.split(" ");
  // Finish lighting at ~85% of the scroll so the last words rest on screen before unpinning.
  const lit = Math.min(1, progress / 0.85) * words.length;
  const pivot = words.indexOf("But");
  const done = progress > 0.88;
  const beat = pivot >= 0 && lit > pivot ? 2 : 1;

  return (
    <section
      id="story"
      ref={ref}
      className="relative h-[280vh] border-t border-border"
    >
      {/* pt clears the fixed header; pb keeps the text off the bottom edge on short screens */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <ParticleField
          formation="book"
          drive="scroll"
          progress={Math.min(1, progress * 1.6)}
          place={{ x: 0, y: 0.02, size: 0.78 }}
          count={1500}
          opacity={0.4}
        />
        <div className="mx-auto grid w-full max-w-[1100px] gap-6 px-6 pt-[84px] pb-8 sm:px-7 sm:pt-24 sm:pb-12 md:grid-cols-[150px_minmax(0,1fr)] md:gap-14">
          {/* rail: where you are in the story */}
          <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-5 md:pt-2">
            <span className="font-mono text-xs tracking-[0.1em] text-primary">
              0{beat} / 02
            </span>
            <div className="h-px flex-1 bg-border md:h-24 md:w-px md:flex-none">
              <div
                className="h-full w-full origin-left scale-x-[var(--p)] bg-primary transition-transform duration-200 md:origin-top md:scale-x-100 md:scale-y-[var(--p)]"
                style={{ "--p": progress } as CSSProperties}
              />
            </div>
            <span className="hidden whitespace-pre-line font-mono text-[11px] leading-[1.6] tracking-[0.08em] text-muted md:block">
              {beat === 1
                ? "WHERE MOST\nOF US START"
                : "WHAT IT WAS\nMEANT TO BE"}
            </span>
          </div>

          <div>
            <p className="max-w-[30em] text-[min(clamp(19px,3.2vw,44px),5.4vh)] leading-[1.28] font-semibold tracking-[-0.03em] text-pretty">
              {words.map((w, i) => (
                <span
                  key={i}
                  className="transition-[opacity,color] duration-300"
                  style={{
                    opacity: i < lit ? 1 : 0.16,
                    color:
                      i >= pivot && i < lit ? "var(--primary)" : "var(--ink)",
                  }}
                >
                  {w}{" "}
                </span>
              ))}
            </p>

            <a
              href="#method"
              aria-hidden={!done}
              tabIndex={done ? 0 : -1}
              className={`mt-8 inline-flex items-center gap-2.5 text-[15px] font-semibold text-ink transition-all duration-500 hover:text-primary ${
                done
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              <span className="h-px w-8 bg-primary" />
              That is the path Al-Mahdrah is built on
              <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
