"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { DiamondMark } from "@/components/ui/diamond-mark";
import { Reveal } from "@/components/ui/reveal";
import type { ReviewRow } from "@/lib/types";

const PAGE_SIZE = 6;
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
    <div className="mx-auto max-w-[1200px] px-7" aria-hidden="true">
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
        <div className="relative mx-auto max-w-[1200px] px-7 pt-[clamp(48px,8vw,96px)] pb-9 lg:pb-16">
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
                <h1 className="mt-5 max-w-[14ch] text-[clamp(38px,5.6vw,76px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-ink">
                  What our students say
                </h1>
                <p className="mt-5 max-w-[48ch] text-[17px] leading-[1.6] text-text">
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
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-md)]">
                  <div className="relative px-7 py-8">
                    <div className="relative flex items-baseline gap-2.5">
                      <span className="text-[56px] leading-none font-semibold tracking-[-0.045em] text-ink">{avgRating}</span>
                      <span className="text-lg text-gold">★★★★★</span>
                    </div>
                    <div className="relative mt-1.5 text-[12.5px] text-muted">
                      average rating from {totalReviews} verified review{totalReviews === 1 ? "" : "s"}
                    </div>

                    <div className="relative mt-6 border-t border-border pt-6">
                      <div className="text-[30px] leading-none font-semibold tracking-[-0.04em] text-ink">{recommendPct}%</div>
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
        <section className="mx-auto max-w-[1200px] px-7">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-border pt-6 pb-6">
            <span className="mr-1 font-mono text-[11.5px] tracking-[0.1em] text-muted">FILTER BY RATING</span>
            {RATING_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectFilter(value)}
                className={`flex h-[38px] items-center rounded-full border px-4 text-[13px] font-medium transition-all duration-200 ${
                  ratingFilter === value
                    ? "border-primary bg-primary text-primary-ink"
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
      <section className="mx-auto max-w-[1200px] px-7 pt-9">
        {visibleReviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleReviews.map((review, i) => {
              return (
                <Reveal key={review.id} delay={(i % 6) * 70} className="h-full">
                  <div className="group relative h-full">
                    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 pt-7 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-[var(--shadow-md)]">
                                            <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-3 right-3 font-serif text-[86px] leading-none text-primary/[0.1] select-none"
                      >
                        &ldquo;
                      </span>

                      <span className="relative text-sm tracking-[2px]">
                        <span className="text-gold">{"★".repeat(review.rating)}</span>
                        <span className="text-border-strong">{"★".repeat(5 - review.rating)}</span>
                      </span>
                      <p className="relative mt-3.5 flex-1 font-serif text-[17px] leading-[1.55] text-ink italic">
                        &ldquo;{review.review_text}&rdquo;
                      </p>
                      <div className="relative mt-5 border-t border-border pt-4">
                        <div className="text-[14px] font-semibold text-ink">{review.name}</div>
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
              className="h-12 rounded-full border border-border-strong bg-surface px-[26px] text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
            >
              Load more reviews
            </button>
          </div>
        )}
      </section>

      {/* LEAVE A REVIEW */}
      <section className="relative mt-16 isolate overflow-hidden bg-[#0E2A47] sm:mt-24">
        <div
          aria-hidden
          className="absolute -top-[40%] -right-[10%] aspect-square w-[70%] rounded-full [mask-image:radial-gradient(circle,#000_30%,transparent_70%)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 1px,transparent 1px 48px),repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 1px,transparent 1px 48px)",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-7 py-[clamp(72px,10vw,128px)]">
          <Reveal>
            <span className="block font-mono text-xs tracking-[0.1em] text-[#C9A24A]">
              CURRENTLY STUDYING WITH US?
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 max-w-[16ch] text-[clamp(34px,5vw,64px)] leading-[1] font-semibold tracking-[-0.045em] text-white">
              Share your experience.
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.6] text-[#B9C4CF]">
              Your honest review helps other families trust their first step with us. It takes
              less than two minutes, and our team checks every review before it appears here.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <Link
              href="/review"
              className="mt-8 inline-flex h-[54px] items-center gap-3 rounded-full bg-[#3BA6C6] px-7 text-[16px] font-semibold text-[#0B1622] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(59,166,198,.8)]"
            >
              Write a review <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
