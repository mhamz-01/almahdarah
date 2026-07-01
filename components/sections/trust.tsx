import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StarRating } from "@/components/ui/star-rating";
import { StatCard } from "@/components/cards/stat-card";
import { TestimonialCard } from "@/components/cards/testimonial-card";
import { trustStats, testimonials } from "@/lib/data/testimonials";

export function Trust() {
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
            <Eyebrow className="text-gold" lineClassName="bg-gold">
              Loved by families
            </Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(30px,3.8vw,52px)] leading-[0.96] tracking-[-0.01em] text-white uppercase">
              Trusted by parents
              <br />
              &amp; students
            </h2>
          </div>
          <div className="flex items-center gap-2.5 rounded-full border border-white/16 bg-white/[0.08] px-[18px] py-[11px]">
            <StarRating className="text-base" />
            <span className="text-sm font-bold">
              4.9<span className="font-medium opacity-60"> /5 · 600+ reviews</span>
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-white/12 bg-white/12 lg:grid-cols-4">
          {trustStats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} accentGold={i % 2 === 1} />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
