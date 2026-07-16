"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import type { AccentToken, ReviewRow } from "@/lib/types";

const PAGE_SIZE = 6;
const CARD_ACCENTS: AccentToken[] = ["primary", "primary-2", "navy", "gold", "green"];
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
        <div className="bg-pattern pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-[1160px] px-7 pt-12 pb-9 sm:pt-16 lg:pt-[68px]">
          <Eyebrow className="text-primary" lineClassName="bg-primary">
            Student &amp; parent reviews
          </Eyebrow>
          <h1 className="mt-4 max-w-[16ch] font-display text-[clamp(32px,4.6vw,58px)] leading-[0.98] tracking-[-0.01em] text-ink uppercase">
            What our students say
          </h1>
          <p className="mt-3.5 max-w-[56ch] text-[15.5px] text-text">
            Real experiences from families and learners across the world — shared in their own words.
          </p>

          {loadError && (
            <p className="mt-6 max-w-[560px] rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
              Couldn&apos;t load reviews right now: {loadError}
            </p>
          )}

          {totalReviews > 0 && (
            <>
              <div className="mt-8 grid max-w-[900px] grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-border bg-border sm:grid-cols-3">
                <div className="bg-surface px-6 py-[22px]">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-[34px] text-ink">{avgRating}</span>
                    <span className="text-[15px] text-gold">★★★★★</span>
                  </div>
                  <div className="mt-1 text-[12.5px] text-muted">average rating</div>
                </div>
                <div className="bg-surface px-6 py-[22px]">
                  <div className="font-display text-[34px] text-ink">{totalReviews}</div>
                  <div className="mt-1 text-[12.5px] text-muted">verified reviews</div>
                </div>
                <div className="bg-surface px-6 py-[22px]">
                  <div className="font-display text-[34px] text-ink">{recommendPct}%</div>
                  <div className="mt-1 text-[12.5px] text-muted">would recommend</div>
                </div>
              </div>

              <div className="mt-6 flex max-w-[440px] flex-col gap-2">
                {distribution.map((d) => (
                  <div key={d.stars} className="flex items-center gap-2.5">
                    <span className="w-[38px] text-[12.5px] font-bold text-text">{d.stars} ★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${d.pct}%` }} />
                    </div>
                    <span className="w-[34px] text-right text-xs text-muted">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* FILTERS */}
      {totalReviews > 0 && (
        <section className="mx-auto max-w-[1160px] px-7">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-border pb-6">
            <span className="mr-1 text-[12.5px] font-bold text-muted">Filter by rating:</span>
            {RATING_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectFilter(value)}
                className={`flex h-[38px] items-center rounded-full border px-4 text-[13px] font-bold transition-colors ${
                  ratingFilter === value
                    ? "border-primary bg-primary text-white"
                    : "border-border-strong bg-surface text-text hover:border-primary"
                }`}
              >
                {value === "all" ? "All reviews" : `${value} star`}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS GRID */}
      <section className="mx-auto max-w-[1160px] px-7 pt-9">
        {visibleReviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleReviews.map((review, i) => (
              <div
                key={review.id}
                className="flex flex-col rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]"
              >
                <span className="text-sm tracking-[2px]">
                  <span className="text-gold">{"★".repeat(review.rating)}</span>
                  <span className="text-border-strong">{"★".repeat(5 - review.rating)}</span>
                </span>
                <p className="mt-3.5 flex-1 font-serif text-[15.5px] leading-[1.55] text-ink italic">
                  &ldquo;{review.review_text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <AvatarPlaceholder accent={CARD_ACCENTS[i % CARD_ACCENTS.length]} size={40} />
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-ink">{review.name}</div>
                    <div className="text-xs text-muted">
                      {reviewerLabels[review.reviewer_type]} · {review.city}, {review.country}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 py-16 text-center">
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
              className="h-12 rounded-full border-[1.5px] border-border-strong bg-surface px-[26px] text-sm font-bold text-fg transition-colors hover:border-primary"
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
