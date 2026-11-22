"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { JoinCommunityDialog } from "@/components/community/join-community-dialog";
import { Tilt } from "./tilt";

export interface FreeItem {
  slug: string;
  title: string;
  subject: string;
  ar: string;
  by: string;
  desc: string;
  schedule: string;
  duration: string;
  live: boolean;
  image: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Auto-advancing showcase of the free courses (7s per slide, pauses on hover). */
export function FreeLibrary({ items }: { items: FreeItem[] }) {
  const [idx, setIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  const active = items[idx];

  const go = (i: number) => {
    setIdx(i);
    setCycle((c) => c + 1);
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="mt-14 grid grid-cols-[minmax(0,1fr)] items-center gap-[clamp(28px,4vw,56px)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
    >
      <div>
        <Tilt className="relative aspect-video overflow-hidden rounded-[18px] bg-navy shadow-[0_40px_80px_-40px_rgba(14,42,71,.55),0_0_0_1px_var(--border)] will-change-transform">
          <Link
            href={`/courses/${active.slug}`}
            aria-label={active.title}
            className="absolute inset-0 z-10"
          />
          {items.map((it, i) => (
            <div
              key={it.slug}
              className="absolute inset-0 transition-[opacity,transform] duration-[900ms,8000ms] ease-[ease,linear]"
              style={{
                opacity: i === idx ? 1 : 0,
                transform: i === idx ? "scale(1.08)" : "scale(1)",
              }}
            >
              {it.image ? (
                <Image
                  src={it.image}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 700px, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-navy">
                  <div
                    className="ds-lattice absolute inset-0 opacity-60"
                    aria-hidden
                  />
                  <span
                    dir="rtl"
                    className="relative px-8 text-center font-kufi text-[clamp(36px,6vw,76px)] leading-[1.2] text-accent"
                  >
                    {it.ar}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,20,34,.8)] from-0% via-[rgba(8,20,34,.25)] via-[26%] to-transparent to-[46%]" />
          <span className="absolute top-4 left-4 rounded-full bg-[rgba(8,20,34,.55)] px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-white backdrop-blur-sm">
            {active.live ? "LIVE · WEEKLY" : "RECORDED SERIES"}
          </span>
          <div className="pointer-events-none absolute right-5 bottom-[18px] left-5 flex items-center justify-between gap-4">
            <span className="flex min-w-0 items-center gap-3.5 text-white">
              <span className="relative flex h-[52px] w-[52px] flex-none items-center justify-center">
                <span className="absolute inset-0 animate-[ds-ring_2s_ease-out_infinite] rounded-full bg-white/55" />
                <span className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white pl-[3px] text-[15px] text-[#0E2A47]">
                  ▶
                </span>
              </span>
              <span className="flex min-w-0 flex-col leading-[1.3]">
                <span className="text-[15px] font-semibold">
                  {active.live ? "Join the class" : "Start watching"}
                </span>
                <span className="truncate text-[12.5px] opacity-80">
                  {active.title}
                </span>
              </span>
            </span>
          </div>
        </Tilt>

        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {items.map((it, i) => {
            const on = i === idx;
            return (
              <button
                key={it.slug}
                type="button"
                onClick={() => go(i)}
                aria-label={it.title}
                className="min-w-0 cursor-pointer border-none bg-transparent p-0 text-left"
              >
                <div
                  className={`relative aspect-video overflow-hidden rounded-[10px] outline-2 outline-offset-2 transition-all duration-[350ms] ${
                    on
                      ? "opacity-100 outline-primary"
                      : "opacity-55 outline-transparent saturate-[.55] hover:opacity-100 hover:saturate-100"
                  }`}
                >
                  {it.image ? (
                    <Image
                      src={it.image}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-navy">
                      <span
                        dir="rtl"
                        className="px-1 text-center font-kufi text-[13px] leading-tight text-accent"
                      >
                        {it.ar}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2.5 h-0.5 overflow-hidden rounded-sm bg-border">
                  {on && (
                    <span
                      key={`${i}-${cycle}`}
                      onAnimationEnd={() => go((idx + 1) % n)}
                      className="block h-full origin-left animate-[ds-fillbar_7s_linear_forwards] bg-primary"
                      style={{
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  )}
                </div>
                <div
                  className={`mt-2 truncate font-mono text-[10.5px] tracking-[0.08em] ${on ? "text-ink" : "text-muted"}`}
                >
                  {pad(i + 1)} · {it.subject}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="grid">
          {items.map((it, i) => {
            const on = i === idx;
            return (
              <div
                key={it.slug}
                aria-hidden={!on}
                className="transition-[opacity,transform,visibility] duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)] [grid-area:1/1]"
                style={{
                  opacity: on ? 1 : 0,
                  transform: on ? "none" : "translateY(14px)",
                  visibility: on ? "visible" : "hidden",
                }}
              >
                <span className="font-mono text-xs tracking-[0.1em] text-muted">
                  {pad(i + 1)} / {pad(n)} · {it.subject}
                </span>
                <div
                  dir="rtl"
                  className="mt-[18px] text-left font-kufi text-[clamp(36px,4.4vw,58px)] leading-[1.2] text-accent"
                >
                  {it.ar}
                </div>
                <div className="mt-3.5 text-[clamp(26px,2.8vw,36px)] leading-[1.08] font-semibold tracking-[-0.03em] text-ink">
                  {it.title}
                </div>
                {it.by && (
                  <div className="mt-2 text-[15px] text-muted">{it.by}</div>
                )}
                <p className="mt-[18px] max-w-[44ch] text-[16.5px] leading-[1.6] text-text">
                  {it.desc}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    it.live ? "Live weekly" : "Recorded series",
                    it.duration,
                  ].map((c, j) => (
                    <span
                      key={c}
                      className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${j === 0 ? "bg-primary-soft text-primary" : "bg-mist text-ink"}`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="mt-2.5 text-[13px] text-muted">
                  {it.schedule}
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  <JoinCommunityDialog courseTitle={it.title}>
                    <button
                      type="button"
                      tabIndex={on ? 0 : -1}
                      className="inline-flex h-[50px] cursor-pointer items-center gap-2.5 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-ink transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-14px_rgba(17,130,163,.75)]"
                    >
                      Be part of the journey <span aria-hidden>→</span>
                    </button>
                  </JoinCommunityDialog>
                  <Link
                    href={`/courses/${it.slug}`}
                    tabIndex={on ? 0 : -1}
                    className="inline-flex h-[50px] items-center rounded-full px-[18px] text-[15px] font-medium text-ink transition-colors hover:text-primary"
                  >
                    See what&apos;s inside
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => go((idx - 1 + n) % n)}
            aria-label="Previous course"
            className="h-[42px] w-[42px] rounded-full border border-border-strong text-[15px] text-ink transition-colors hover:border-primary hover:text-primary"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go((idx + 1) % n)}
            aria-label="Next course"
            className="h-[42px] w-[42px] rounded-full border border-border-strong text-[15px] text-ink transition-colors hover:border-primary hover:text-primary"
          >
            →
          </button>
          <span className="ml-2 font-mono text-xs text-muted">
            {pad(idx + 1)} / {pad(n)}
          </span>
        </div>
      </div>
    </div>
  );
}
