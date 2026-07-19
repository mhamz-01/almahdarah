import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { StarRating } from "@/components/ui/star-rating";
import { StatCard } from "@/components/cards/stat-card";
import { TestimonialCard } from "@/components/cards/testimonial-card";
import { trustStats } from "@/lib/data/testimonials";
import { getPublishedReviews } from "@/lib/supabase";
import type { AccentToken, ReviewRow, Testimonial } from "@/lib/types";

const CARD_ACCENTS: AccentToken[] = ["navy", "primary", "primary-2", "gold", "green"];
const REVIEWER_LABEL: Record<ReviewRow["reviewer_type"], string> = {
  parent: "Parent",
  student: "Student",
};

function toTestimonial(review: ReviewRow, accentIndex: number, featured = false): Testimonial {
  return {
    quote: review.review_text,
    name: review.name,
    role: `${REVIEWER_LABEL[review.reviewer_type]} · ${review.city}, ${review.country}`,
    accent: CARD_ACCENTS[accentIndex % CARD_ACCENTS.length],
    featured,
  };
}

export async function Trust() {
  const { data } = await getPublishedReviews();
  const reviews = data ?? [];
  const totalReviews = reviews.length;

  const featuredTestimonial = reviews[0] ? toTestimonial(reviews[0], 0, true) : undefined;
  const restTestimonials = reviews.slice(1, 4).map((review, i) => toTestimonial(review, i + 1));
  const allTestimonials = featuredTestimonial ? [featuredTestimonial, ...restTestimonials] : [];

  return (
    <section id="trust" className="relative overflow-hidden bg-navy">
      <div className="bg-pattern pointer-events-none absolute inset-0 opacity-60" />
      <Image
        src="/assets/almahdrah-logo.png"
        alt=""
        width={260}
        height={260}
        loading="lazy"
        className="pointer-events-none absolute -top-10 -left-[50px] w-[260px] opacity-[0.07] invert"
      />

      <div className="relative mx-auto max-w-[1240px] px-7 py-16 text-white sm:py-20 lg:py-[108px]">
        <div className="flex flex-wrap items-end justify-between gap-[18px]">
          <div className="max-w-[620px]">
            <Reveal>
              <Eyebrow className="text-gold" lineClassName="bg-gold">
                Loved by families
              </Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 font-display text-[clamp(30px,3.8vw,52px)] leading-[0.96] tracking-[-0.01em] text-white uppercase">
                Trusted by parents
                <br />
                &amp; students
              </h2>
            </Reveal>
          </div>
          <Reveal delay={180}>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2.5 rounded-full border border-white/16 bg-white/[0.08] px-[18px] py-[11px]">
                <StarRating className="text-base" />
                <span className="text-sm font-bold">
                  5
                  <span className="font-medium opacity-60">
                    {" "}
                    /5 · {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                  </span>
                </span>
              </div>
              <Button href="/reviews" variant="invert" size="sm" withArrow>
                View all reviews
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-[20px] border border-white/12 bg-white/12">
          {trustStats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70} className="h-full">
              <StatCard {...stat} accentGold={i % 2 === 1} />
            </Reveal>
          ))}
        </div>

        {featuredTestimonial && (
          <>
            {/* Tablet / desktop: static grid */}
            <div className="mt-5 hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {allTestimonials.map((testimonial, i) => (
                <Reveal key={i} delay={i * 80} className={testimonial.featured ? "col-span-full" : ""}>
                  <TestimonialCard {...testimonial} />
                </Reveal>
              ))}
            </div>

            {/* Mobile: featured review static, rest in a continuous slider */}
            <div className="mt-5 sm:hidden">
              <TestimonialCard {...featuredTestimonial} />

              {restTestimonials.length > 0 && (
                <div
                  className="group relative mt-5 -mx-7 overflow-hidden"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
                    maskImage:
                      "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
                  }}
                >
                  <div
                    className="animate-marquee flex w-max items-stretch gap-5 px-7 group-hover:[animation-play-state:paused]"
                    style={{ animationDuration: "28s" }}
                  >
                    {[...restTestimonials, ...restTestimonials].map((testimonial, i) => (
                      <div key={i} className="w-[82vw] max-w-[320px] shrink-0">
                        <TestimonialCard {...testimonial} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
