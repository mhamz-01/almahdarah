"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export interface FanReview {
  id: string;
  name: string;
  place: string;
  rating: number;
  role: string;
  text: string;
}

const ACCENTS = ["var(--primary)", "var(--gold)", "var(--green)", "var(--navy)"];

/** How many cards either side of the centre are visible at each breakpoint (matches the CSS). */
function visibleHalf() {
  if (window.matchMedia("(min-width: 768px)").matches) return 2;
  return 1;
}

/**
 * Reviews held like a hand of cards, shown a few at a time. The fan opens when scrolled into
 * view, then slides on by itself: the cards travel along the arc, the middle one lifts out to be
 * read, and the next one takes its place. Hover/tap a side card to bring it to the middle, or
 * swipe. If there are too few reviews to fill the loop they repeat so the slide never jumps.
 */
export function ReviewsFan({ reviews }: { reviews: FanReview[] }) {
  // the loop must be longer than the visible window or a card would visibly jump sides
  const MIN_LOOP = 9;
  const loop = (() => {
    const copies = Math.max(1, Math.ceil(MIN_LOOP / reviews.length));
    return Array.from({ length: copies }, (_, k) =>
      reviews.map((r) => ({ ...r, key: `${r.id}-${k}` })),
    ).flat();
  })();
  const n = loop.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const [center, setCenter] = useState(0);
  const [half, setHalf] = useState(1);
  const [paused, setPaused] = useState(false);

  // open the fan once it scrolls into view
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
      setSettled(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setOpen(true);
          window.setTimeout(() => setSettled(true), 1600);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // how many cards fit at this screen width
  useEffect(() => {
    const sync = () => setHalf(visibleHalf());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // slide on by itself
  useEffect(() => {
    if (!settled || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setCenter((c) => c + 1), 3400);
    return () => window.clearInterval(t);
  }, [settled, paused]);

  // signed distance from the middle, wrapped so the nearest copy of each card is used
  const offset = (i: number) => {
    const raw = (((i - center) % n) + n) % n;
    return raw > n / 2 ? raw - n : raw;
  };

  const go = (by: number) => setCenter((c) => c + by);

  // pagination works on the real reviews, not the repeated loop
  const m = reviews.length;
  const page = ((center % m) + m) % m;
  const goTo = (k: number) => {
    let delta = k - page;
    if (delta > m / 2) delta -= m;
    if (delta < -m / 2) delta += m;
    go(delta);
  };

  return (
    <div
      ref={rootRef}
      className="rfan"
      data-open={open}
      data-settled={settled}
      style={{ touchAction: "pan-y" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={(e) => {
        touchX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        const from = touchX.current;
        touchX.current = null;
        if (from === null || e.pointerType === "mouse") return;
        const dx = e.clientX - from;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      <ul className="contents">
        {loop.map((r, i) => {
          const d = offset(i);
          const ad = Math.abs(d);
          const shown = ad <= half;
          const on = d === 0;
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <li
              key={r.key}
              className="rfan-card"
              data-active={on}
              data-shown={shown}
              aria-hidden={!shown}
              style={
                {
                  "--d": d,
                  "--ad": Math.round(ad),
                  zIndex: 20 + Math.round(d * 2),
                } as CSSProperties
              }
            >
              <button
                type="button"
                tabIndex={shown ? 0 : -1}
                onClick={() => go(d)}
                aria-label={`Review by ${r.name}`}
                aria-current={on}
                className={`flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[calc(var(--w)*0.085)] border border-border bg-paper text-left transition-shadow duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  on
                    ? "shadow-[0_26px_50px_-16px_rgba(17,40,70,.45)]"
                    : "shadow-[0_10px_24px_-14px_rgba(17,40,70,.4)]"
                }`}
              >
                <span
                  aria-hidden
                  className="h-[calc(var(--w)*0.03)] w-full flex-none"
                  style={{ background: accent }}
                />
                <span className="relative flex min-h-0 flex-1 flex-col p-[calc(var(--w)*0.09)] pt-[calc(var(--w)*0.07)]">
                  {/* big quote mark, watermark-style */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-[calc(var(--w)*0.02)] right-[calc(var(--w)*0.06)] font-serif leading-none"
                    style={{
                      fontSize: "calc(var(--w) * 0.42)",
                      color: accent,
                      opacity: 0.16,
                    }}
                  >
                    ”
                  </span>
                  <span
                    aria-hidden
                    className="rfan-text relative text-gold"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    {"★".repeat(Math.max(1, Math.min(5, r.rating)))}
                  </span>
                  <span className="rfan-text relative mt-[calc(var(--w)*0.03)] line-clamp-7 min-h-0 flex-1 text-ink">
                    {r.text}
                  </span>
                  <span className="relative mt-2 flex flex-none items-center gap-[calc(var(--w)*0.04)] border-t border-border pt-[calc(var(--w)*0.045)]">
                    <span
                      aria-hidden
                      className="flex flex-none items-center justify-center rounded-full font-semibold text-white"
                      style={{
                        width: "calc(var(--w) * 0.15)",
                        height: "calc(var(--w) * 0.15)",
                        fontSize: "calc(var(--w) * 0.068)",
                        background: accent,
                      }}
                    >
                      {r.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block truncate font-semibold text-ink"
                        style={{ fontSize: "calc(var(--w) * 0.062)" }}
                      >
                        {r.name}
                      </span>
                      <span
                        className="block truncate text-muted"
                        style={{ fontSize: "calc(var(--w) * 0.05)" }}
                      >
                        {[r.role, r.place].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>


      {/* pagination */}
      <nav
        aria-label="Reviews"
        className="absolute left-1/2 z-[70] flex -translate-x-1/2 items-center gap-1.5"
        style={{ bottom: "calc(var(--w) * -0.34)" }}
      >
        <button
          type="button"
          aria-label="Previous review"
          onClick={() => go(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper text-ink transition-colors hover:border-primary hover:text-primary"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
        <div className="flex items-center">
          {reviews.map((r, k) => (
            <button
              key={r.id}
              type="button"
              aria-label={`Review ${k + 1} of ${m}`}
              aria-current={k === page}
              onClick={() => goTo(k)}
              className="flex h-9 w-[14px] items-center justify-center sm:w-[18px]"
            >
              <span
                className={`block h-[6px] rounded-full transition-all duration-300 ${
                  k === page ? "w-6 bg-primary" : "w-[6px] bg-border-strong hover:bg-muted"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Next review"
          onClick={() => go(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper text-ink transition-colors hover:border-primary hover:text-primary"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
