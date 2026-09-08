"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QuoteCard } from "@/components/quotes/quote-card";
import { QuoteModalContent } from "@/components/quotes/quote-modal-content";
import { colorFor } from "@/lib/quotes";
import type { QuoteEntry } from "@/lib/types";

type TopicFilter = "all" | string;

interface RopePath {
  key: string;
  d: string;
}

interface StringLine {
  key: string;
  x: number;
  ropeY: number;
  cardY: number;
  color: string;
}

interface MeasuredCard {
  id: number;
  x: number;
  top: number;
  color: string;
}

const LARGE_PAGE_SIZE = 9;
const SMALL_PAGE_SIZE = 6;
const LARGE_SCREEN_QUERY = "(min-width: 1024px)";

function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(true);

  useLayoutEffect(() => {
    const mql = window.matchMedia(LARGE_SCREEN_QUERY);
    const update = () => setIsLarge(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isLarge;
}

interface WallOfQuotesProps {
  quotes: QuoteEntry[];
  loadError: string | null;
}

export function WallOfQuotes({ quotes, loadError }: WallOfQuotesProps) {
  const [topic, setTopic] = useState<TopicFilter>("all");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [ropes, setRopes] = useState<RopePath[]>([]);
  const [strings, setStrings] = useState<StringLine[]>([]);

  const isLargeScreen = useIsLargeScreen();
  const pageSize = isLargeScreen ? LARGE_PAGE_SIZE : SMALL_PAGE_SIZE;

  const wallRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<number, HTMLDivElement>());
  const rafRef = useRef<number | null>(null);
  const lastMeasureRef = useRef<string>("");

  const topics = useMemo(
    () => Array.from(new Set(quotes.map((q) => q.topicKey))).sort((a, b) => a.localeCompare(b)),
    [quotes],
  );

  const filtered = useMemo(
    () => (topic === "all" ? quotes : quotes.filter((q) => q.topicKey === topic)),
    [quotes, topic],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

  function selectTopic(next: TopicFilter) {
    setTopic(next);
    setPage(1);
  }

  useEffect(() => {
    function measure() {
      const wall = wallRef.current;
      if (!wall) return;
      const wallRect = wall.getBoundingClientRect();

      const entries: MeasuredCard[] = [];
      paged.forEach((q) => {
        const el = cardRefs.current.get(q.id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        entries.push({
          id: q.id,
          x: Math.round(r.left - wallRect.left + r.width / 2),
          top: Math.round(r.top - wallRect.top),
          color: colorFor(q.topicKey),
        });
      });

      const buckets = new Map<number, MeasuredCard[]>();
      entries.forEach((e) => {
        const key = Math.round(e.top / 12) * 12;
        const list = buckets.get(key) ?? [];
        list.push(e);
        buckets.set(key, list);
      });

      const fullW = wallRect.width;
      const nextRopes: RopePath[] = [];
      const nextStrings: StringLine[] = [];
      const rowKeys = [...buckets.keys()].sort((a, b) => a - b);

      rowKeys.forEach((key, rowIndex) => {
        const group = buckets.get(key)!;
        const rowTop = Math.min(...group.map((e) => e.top));
        const sag = 40 + (rowIndex % 3) * 12;
        const ropeBaseY = rowTop - 108;
        nextRopes.push({
          key: `r${key}`,
          d: `M0,${ropeBaseY} Q${fullW / 2},${ropeBaseY + 2 * sag} ${fullW},${ropeBaseY}`,
        });
        group.forEach((e) => {
          const f = fullW > 0 ? e.x / fullW : 0.5;
          const ropeY = Math.round(ropeBaseY + 4 * sag * f * (1 - f));
          nextStrings.push({ key: `s${e.id}`, x: e.x, ropeY, cardY: e.top, color: e.color });
        });
      });

      const snapshot = JSON.stringify({ ropes: nextRopes, strings: nextStrings });
      if (snapshot === lastMeasureRef.current) return;
      lastMeasureRef.current = snapshot;
      setRopes(nextRopes);
      setStrings(nextStrings);
    }

    function schedule() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    }

    schedule();
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    if (wallRef.current) ro.observe(wallRef.current);

    return () => {
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paged]);

  const activeIndex = filtered.findIndex((q) => q.id === activeId);
  const activeQuote = activeIndex >= 0 ? filtered[activeIndex] : null;

  function closeModal(open: boolean) {
    if (!open) setActiveId(null);
  }

  function stepQuote(dir: 1 | -1) {
    if (!filtered.length || activeIndex < 0) return;
    const next = (activeIndex + dir + filtered.length) % filtered.length;
    setActiveId(filtered[next].id);
  }

  return (
    <div className="overflow-x-hidden bg-bg text-text">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 font-serif text-[min(58vw,460px)] leading-none text-ink/[0.045] select-none"
        >
          &ldquo;
        </span>
        <div className="relative mx-auto max-w-[760px] px-6 pt-14 pb-8 text-center sm:pt-20 sm:pb-11">
          <span className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">
            From the majlis to the page
          </span>
          <h1 className="mx-auto mt-[18px] font-display text-[clamp(36px,5.4vw,64px)] leading-[0.96] tracking-[-0.01em] text-ink uppercase">
            Wall of Quotes
          </h1>
          <p className="mx-auto mt-5 max-w-[52ch] font-serif text-[clamp(17px,1.8vw,20px)] leading-[1.5] text-text italic">
            Passages our teachers read aloud in class, and quotes they share with our communities —
            set down here, catalogued by theme.
          </p>
          {loadError && (
            <p className="mx-auto mt-6 max-w-[480px] rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-left text-sm text-red-600">
              Couldn&apos;t load quotes right now: {loadError}
            </p>
          )}
        </div>
      </section>

      {quotes.length > 0 && (
        <>
          {/* TOPIC FILTER */}
          <div className="sticky top-[69px] z-[60] border-t border-b border-border bg-bg/92 backdrop-blur-md">
            <div className="no-scrollbar mx-auto flex max-w-[1100px] flex-nowrap items-baseline justify-start overflow-x-auto px-6 py-3.5 sm:flex-wrap sm:justify-center sm:overflow-visible">
              <button
                type="button"
                onClick={() => selectTopic("all")}
                className={`shrink-0 border-b-2 px-4 py-2 text-[13.5px] whitespace-nowrap transition-colors ${
                  topic === "all" ? "font-bold text-ink" : "font-medium text-muted"
                }`}
                style={{ borderBottomColor: topic === "all" ? "var(--ink)" : "transparent" }}
              >
                All
              </button>
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => selectTopic(t)}
                  className={`shrink-0 border-l border-b-2 border-l-border px-4 py-2 text-[13.5px] whitespace-nowrap transition-colors ${
                    topic === t ? "font-bold text-ink" : "font-medium text-muted"
                  }`}
                  style={{ borderBottomColor: topic === t ? colorFor(t) : "transparent" }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* CLOTHESLINE WALL */}
          <div ref={wallRef} className="relative left-1/2 w-screen -translate-x-1/2">
            <svg
              className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              {ropes.map((rope) => (
                <path
                  key={rope.key}
                  d={rope.d}
                  style={{
                    fill: "none",
                    stroke: "#B9B4A8",
                    strokeWidth: 1.5,
                    strokeLinecap: "round",
                    strokeDasharray: "6 6",
                    opacity: 0.8,
                  }}
                />
              ))}
              {strings.map((s) => (
                <g key={s.key}>
                  <line
                    x1={s.x}
                    y1={s.ropeY}
                    x2={s.x}
                    y2={s.cardY}
                    style={{ stroke: "#B9B4A8", strokeWidth: 1.2, opacity: 0.6 }}
                  />
                  <circle cx={s.x} cy={s.ropeY} r={3.5} style={{ fill: "#B9B4A8", opacity: 0.85 }} />
                </g>
              ))}
            </svg>

            <div className="relative z-[1] mx-auto max-w-[1100px] px-6 pt-[clamp(70px,9vw,96px)] pb-16 sm:pb-20">
              {paged.length > 0 ? (
                <div className="grid grid-cols-1 items-start gap-x-[22px] gap-y-[160px] sm:grid-cols-2 lg:grid-cols-3">
                  {paged.map((quote) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      setRef={(el) => {
                        if (el) cardRefs.current.set(quote.id, el);
                        else cardRefs.current.delete(quote.id);
                      }}
                      onOpen={() => setActiveId(quote.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-[14px] text-muted">No quotes match this theme yet.</p>
              )}

              {totalPages > 1 && (
                <nav
                  aria-label="Quotes pagination"
                  className="mt-14 flex flex-wrap items-center justify-center gap-1.5 sm:mt-16"
                >
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm font-bold text-text transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === currentPage ? "page" : undefined}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 font-mono text-[12.5px] font-bold transition-colors ${
                        n === currentPage
                          ? "bg-primary text-white"
                          : "text-muted hover:bg-surface-2 hover:text-ink"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm font-bold text-text transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border"
                  >
                    →
                  </button>
                </nav>
              )}
            </div>
          </div>
        </>
      )}

      {/* CTA */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(152deg, var(--primary) 0%, var(--primary-2) 100%)" }}
      >
        <div className="relative mx-auto max-w-[800px] px-6 py-[clamp(50px,7vw,80px)] text-center text-white">
          <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(26px,3.6vw,42px)] leading-[1] tracking-[-0.01em] uppercase">
            Go deeper with a teacher
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[15px] opacity-[0.94]">
            These words are a beginning. Book a free demo and study them properly — with context,
            chain, and a teacher who can answer your questions.
          </p>
          <div className="mt-[26px]">
            <Button href="/book-a-demo" variant="gold" size="lg" withArrow>
              Book a free demo
            </Button>
          </div>
        </div>
      </section>

      {/* MODAL */}
      <Dialog open={activeQuote !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-[640px] p-8 sm:p-[52px]" showClose={false}>
          {activeQuote && (
            <QuoteModalContent
              quote={activeQuote}
              onClose={() => setActiveId(null)}
              onPrev={() => stepQuote(-1)}
              onNext={() => stepQuote(1)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
