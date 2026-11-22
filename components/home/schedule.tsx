"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { ParticleField } from "./particle-field";

export interface ClassSlot {
  slug: string;
  title: string;
  subject: string;
  ar: string;
  /** 0 = Monday … 6 = Sunday. Classes run after Isha, Pakistan time, so there is no fixed clock time. */
  dayIdx: number;
  color: string;
}

const WEEK_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const PKT_OFFSET = 5 * 3600_000;

/** Today's weekday in Pakistan (0 = Monday), or -1 until the client knows the time. */
function pakistanDayIdx(now: Date | null) {
  if (!now) return -1;
  const p = new Date(now.getTime() + PKT_OFFSET);
  return (p.getUTCDay() + 6) % 7;
}

/* ---- the path: a gentle winding line; stops sit on it ---- */
const VB_W = 1000;
const VB_H = 150;
/** the same winding line, in 0..1 box coordinates, for the particle route */
const ROUTE: [number, number][] = Array.from({ length: 101 }, (_, i) => {
  const x = (i / 100) * 1000;
  return [
    i / 100,
    (75 + Math.sin((x / 1000) * Math.PI * 2.2 + 0.4) * 34) / 150,
  ];
});
const yAt = (x: number) =>
  VB_H / 2 + Math.sin((x / VB_W) * Math.PI * 2.2 + 0.4) * 34;

type Status = "done" | "next" | "tonight" | "later";

export function Schedule({ slots }: { slots: ClassSlot[] }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the current time is only known on the client
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 5 * 60_000);
    return () => clearInterval(id);
  }, []);

  // only the days that have a class, in week order (days off are simply not shown)
  const stops = useMemo(
    () => [...slots].sort((a, b) => a.dayIdx - b.dayIdx),
    [slots],
  );

  const status = useMemo<Status[]>(() => {
    const today = pakistanDayIdx(now);
    if (today < 0) return stops.map(() => "later");
    let nextIdx = stops.findIndex((s) => s.dayIdx >= today);
    const weekOver = nextIdx === -1;
    if (weekOver) nextIdx = 0; // the next stop is Monday's
    return stops.map((s, i) => {
      if (i === nextIdx)
        return !weekOver && s.dayIdx === today ? "tonight" : "next";
      if (weekOver) return "done";
      return i < nextIdx ? "done" : "later";
    });
  }, [stops, now]);

  const n = stops.length;

  return (
    <section
      id="schedule"
      className="relative isolate overflow-hidden border-t border-border bg-surface"
    >
      <div className="mx-auto max-w-[1200px] px-7 py-[clamp(88px,11vw,140px)]">
        <div>
          <Reveal>
            <span className="block font-mono text-xs tracking-[0.1em] text-primary">
              THE WEEKLY PATH · LIVE CLASSES
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-[18px] max-w-[22ch] text-[clamp(32px,4.4vw,56px)] leading-[1.04] font-semibold tracking-[-0.04em] text-ink">
              {n} evenings. One steady path.
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 max-w-[48ch] text-[17px] leading-[1.6] text-text">
              Every week, after Isha. The same teachers, the same subjects, a
              step on the path each evening. Follow it from the first stop to
              the last.
            </p>
          </Reveal>
        </div>

        {/* ---------- the path ---------- */}
        <div className="mt-14">
          {/* winding line + stops (desktop) */}
          <div className="relative isolate hidden md:block">
            <ParticleField
              formation="route"
              route={ROUTE}
              count={900}
              opacity={0.85}
            />
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="block h-auto w-full overflow-visible"
              aria-hidden
            >
              {stops.map((s, i) => {
                const x = ((i + 0.5) / n) * VB_W;
                const y = yAt(x);
                const st = status[i];
                const hot = st === "next" || st === "tonight";
                const filled = st === "done" || hot;
                return (
                  <g key={`${s.slug}-${s.dayIdx}`}>
                    {hot && (
                      <circle
                        cx={x}
                        cy={y}
                        r="30"
                        fill="var(--primary)"
                        opacity="0.14"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r="19"
                      fill={filled ? "var(--primary)" : "var(--paper)"}
                      stroke={
                        filled ? "var(--primary)" : "var(--border-strong)"
                      }
                      strokeWidth="3"
                    />
                    <text
                      x={x}
                      y={y + 5.5}
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="600"
                      fill={filled ? "var(--primary-ink)" : "var(--ink)"}
                      fontFamily="var(--font-geist-mono), monospace"
                    >
                      {st === "done" ? "✓" : i + 1}
                    </text>
                  </g>
                );
              })}
              {/* destination flag */}
              <g transform={`translate(${VB_W - 4} ${yAt(VB_W - 4) - 2})`}>
                <path
                  d="M0 0v-30"
                  stroke="var(--ink)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path d="M0 -30h22l-6 8 6 8H0z" fill="var(--accent)" />
              </g>
            </svg>
          </div>

          <ol
            className="relative mt-2 grid grid-cols-[minmax(0,1fr)] before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-0 before:border-l-[3px] before:border-dotted before:border-border-strong md:mt-0 md:gap-5 md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))] md:before:hidden"
            style={{ ["--n" as string]: n }}
          >
            {stops.map((s, i) => {
              const st = status[i];
              const hot = st === "next" || st === "tonight";
              const done = st === "done";
              return (
                <li
                  key={`${s.slug}-${s.dayIdx}`}
                  className="relative pb-6 pl-12 md:pb-0 md:pl-0"
                >
                  {/* mobile stop marker */}
                  <span
                    aria-hidden
                    className={`absolute top-1 left-0 flex h-8 w-8 items-center justify-center rounded-full border-[3px] font-mono text-[13px] font-semibold md:hidden ${
                      done || hot
                        ? "border-primary bg-primary text-primary-ink"
                        : "border-border-strong bg-paper text-ink"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>

                  <Link
                    href={`/courses/${s.slug}`}
                    className={`group block h-full rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 ${
                      hot
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-paper hover:border-border-strong"
                    } ${done ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11.5px] tracking-[0.1em] text-muted">
                        STOP {String(i + 1).padStart(2, "0")}
                      </span>
                      {hot && (
                        <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] whitespace-nowrap text-primary-ink">
                          {st === "tonight" ? "TONIGHT" : "NEXT CLASS"}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-[clamp(26px,2.6vw,34px)] leading-none font-semibold tracking-[-0.03em] text-ink">
                      {WEEK_LONG[s.dayIdx]}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[13.5px] font-medium text-primary">
                      <svg
                        viewBox="0 0 16 16"
                        className="h-3.5 w-3.5"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M13.2 10.4A6 6 0 0 1 5.6 2.8a6 6 0 1 0 7.6 7.6z" />
                      </svg>
                      After Isha
                    </div>
                    <div className="mt-4 text-[16px] leading-[1.3] font-semibold text-ink transition-colors group-hover:text-primary">
                      {s.title}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] tracking-[0.08em] text-muted">
                        {s.subject}
                      </span>
                      <span
                        dir="rtl"
                        className="font-kufi text-[18px] leading-none text-accent"
                      >
                        {s.ar}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-10 max-w-[62ch] text-[13.5px] leading-[1.6] text-muted">
          Classes begin after Isha, Pakistan time, usually between 7:30 and
          8:00 PM. The start time moves a little through the year, so the exact
          time is shared each week in the community group.
        </p>
      </div>
    </section>
  );
}
