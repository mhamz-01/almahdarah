"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { DiamondMark } from "@/components/ui/diamond-mark";
import { Reveal } from "@/components/ui/reveal";
import type { AccentToken, ReviewRow } from "@/lib/types";

const PAGE_SIZE = 6;
const CARD_ACCENTS: AccentToken[] = ["primary", "gold", "navy", "primary-2", "green"];
const RATING_FILTERS = ["all", 5, 4, 3, 2, 1] as const;
type RatingFilter = (typeof RATING_FILTERS)[number];

const reviewerLabels: Record<ReviewRow["reviewer_type"], string> = {
  parent: "Parent",
  student: "Student",
};

interface ReviewsExplorerProps {
  reviews: ReviewRow[];
  loadError: string | null;
}

function OrnateDivider() {
  return (
    <div className="mx-auto max-w-[1160px] px-7" aria-hidden="true">
      <span className="block h-px bg-border" />
    </div>
  );
}

export function ReviewsExplorer({ reviews, loadError }: ReviewsExplorerProps) {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const recommendPct = totalReviews
    ? Math.round((reviews.filter((r) => r.rating >= 4).length / totalReviews) * 100)
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    return { stars, pct: totalReviews ? Math.round((count / totalReviews) * 100) : 0 };
  });

  const filteredReviews = useMemo(
    () => (ratingFilter === "all" ? reviews : reviews.filter((r) => r.rating === ratingFilter)),
    [reviews, ratingFilter],
  );
  const visibleReviews = filteredReviews.slice(0, visibleCount);

  function selectFilter(value: RatingFilter) {
    setRatingFilter(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="bg-bg text-text">
      {/* HERO / TRUST SUMMARY */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-[1160px] px-7 pt-12 pb-9 sm:pt-16 lg:pt-[68px] lg:pb-16">
          <div
            className={
              totalReviews > 0
                ? "grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:gap-16"
                : ""
            }
          >
            <div>
              <Reveal>
                <Eyebrow className="text-primary" lineClassName="bg-primary">
                  Student &amp; parent reviews
                </Eyebrow>
                <h1 className="mt-4 max-w-[16ch] font-display text-[clamp(32px,4.6vw,58px)] leading-[0.98] tracking-[-0.01em] text-ink uppercase">
                  What our students say
                </h1>
                <p className="mt-3.5 max-w-[56ch] text-[15.5px] text-text">
                  Real experiences from families and learners across the world — shared in their own words.
                </p>
              </Reveal>

              {loadError && (
                <p className="mt-6 max-w-[560px] rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
                  Couldn&apos;t load reviews right now: {loadError}
                </p>
              )}
            </div>

            {totalReviews > 0 && (
              <Reveal delay={100}>
                <div className="overflow-hidden rounded-[26px] border border-border bg-surface shadow-[var(--shadow-lg)]">
                  <div className="relative px-7 py-8">
                    <div className="relative flex items-baseline gap-2.5">
                      <span className="font-display text-[46px] leading-none text-ink">{avgRating}</span>
                      <span className="text-lg text-gold">★★★★★</span>
                    </div>
                    <div className="relative mt-1.5 text-[12.5px] text-muted">
                      average rating from {totalReviews} verified review{totalReviews === 1 ? "" : "s"}
                    </div>

                    <div className="relative mt-6 border-t border-border pt-6">
                      <div className="font-display text-[26px] text-ink">{recommendPct}%</div>
                      <div className="mt-0.5 text-[12px] text-muted">would recommend us to a friend</div>
                    </div>

                    <div className="relative mt-6 flex flex-col gap-2 border-t border-border pt-6">
                      {distribution.map((d) => (
                        <div key={d.stars} className="flex items-center gap-2.5">
                          <span className="w-[34px] text-[12px] font-bold text-text">{d.stars} ★</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full bg-gold transition-[width] duration-700 ease-out"
                              style={{ width: `${d.pct}%` }}
                            />
                          </div>
                          <span className="w-[30px] text-right text-xs text-muted">{d.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <OrnateDivider />

      {/* FILTERS */}
      {totalReviews > 0 && (
        <section className="mx-auto max-w-[1160px] px-7">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-border pt-6 pb-6">
            <span className="mr-1 text-[12.5px] font-bold text-muted">Filter by rating:</span>
            {RATING_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectFilter(value)}
                className={`flex h-[38px] items-center rounded-full border px-4 text-[13px] font-bold transition-all duration-200 ${
                  ratingFilter === value
                    ? "border-gold bg-primary text-white shadow-[0_0_0_3px_rgba(242,201,83,0.25)]"
                    : "border-border-strong bg-surface text-text hover:border-primary"
                }`}
              >
                {value === "all" ? "All reviews" : `${value} star`}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* WALL OF REVIEWS */}
      <section className="mx-auto max-w-[1160px] px-7 pt-9">
        {visibleReviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleReviews.map((review, i) => {
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              return (
                <Reveal key={review.id} delay={(i % 6) * 70} className="h-full">
                  <div className="group relative h-full">
                    <div className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-surface p-6 pt-7 shadow-[var(--shadow-sm)] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-gold group-hover:shadow-[var(--shadow-md)]">
                      <div
                        className="absolute inset-x-0 top-0 h-[3px] opacity-80"
                        style={{ background: `var(--${accent})` }}
                        aria-hidden="true"
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-3 right-3 font-serif text-[76px] leading-none text-ink/[0.06] select-none"
                      >
                        &ldquo;
                      </span>

                      <span className="relative text-sm tracking-[2px]">
                        <span className="text-gold">{"★".repeat(review.rating)}</span>
                        <span className="text-border-strong">{"★".repeat(5 - review.rating)}</span>
                      </span>
                      <p className="relative mt-3.5 flex-1 font-serif text-[15.5px] leading-[1.55] text-ink italic">
                        &ldquo;{review.review_text}&rdquo;
                      </p>
                      <div className="relative mt-5 border-t border-border pt-4">
                        <div className="text-[13.5px] font-bold text-ink">{review.name}</div>
                        <div className="text-xs text-muted">
                          {reviewerLabels[review.reviewer_type]} · {review.city}, {review.country}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <DiamondMark className="h-7 w-7 opacity-30" colorClassName="border-ink" />
            <span className="text-[15px] font-bold text-ink">
              {totalReviews === 0 ? "No reviews yet — be the first to share yours" : "No reviews match this filter yet"}
            </span>
            {totalReviews > 0 && <span className="text-[13.5px] text-muted">Try a different rating filter.</span>}
          </div>
        )}

        {filteredReviews.length > visibleCount && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="h-12 rounded-full border-[1.5px] border-border-strong bg-surface px-[26px] text-sm font-bold text-fg transition-colors hover:border-gold"
            >
              Load more reviews
            </button>
          </div>
        )}
      </section>

      {/* LEAVE A REVIEW CTA */}
      <section
        className="relative mt-16 overflow-hidden sm:mt-20"
        style={{ background: "linear-gradient(150deg, var(--primary) 0%, var(--primary-2) 100%)" }}
      >
        <div className="bg-pattern pointer-events-none absolute inset-0 opacity-50" />
        <DiamondMark
          className="pointer-events-none absolute -bottom-14 -left-14 h-[200px] w-[200px] opacity-[0.08]"
          colorClassName="border-white"
        />
        <div className="relative mx-auto max-w-[720px] px-7 py-16 text-center text-white sm:py-[88px]">
          <span className="inline-flex items-center gap-2.5 text-[12.5px] font-bold tracking-[0.2em] text-gold uppercase">
            <span className="h-0.5 w-[22px] bg-gold" />
            Currently studying with us?
          </span>
          <h2 className="mx-auto mt-4 max-w-[18ch] font-display text-[clamp(26px,3.6vw,42px)] leading-[1.02] tracking-[-0.01em] uppercase">
            Share your experience
          </h2>
          <p className="mx-auto mt-3.5 max-w-[48ch] text-[15px] opacity-[0.94]">
            Your honest review helps other families trust their first step with us — it takes less than two
            minutes.
          </p>
          <div className="mt-6">
            <Button href="/review" variant="gold" size="lg" withArrow>
              Write a review
            </Button>
          </div>
          <p className="mt-3.5 text-[12.5px] opacity-80">
            Reviews are checked by our team before they appear here.
          </p>
        </div>
      </section>
    </div>
  );
}
