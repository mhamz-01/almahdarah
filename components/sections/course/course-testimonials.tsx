import type { CourseTestimonial } from "@/lib/types";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { CourseTestimonialCard } from "@/components/cards/course-testimonial-card";

interface CourseTestimonialsProps {
  testimonials: CourseTestimonial[];
}

export function CourseTestimonials({ testimonials }: CourseTestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1240px] py-16 sm:py-20 lg:py-[96px]">
      <div className="px-7">
        <Reveal>
          <Eyebrow className="text-primary" lineClassName="bg-primary">
            From students &amp; parents
          </Eyebrow>
        </Reveal>
      </div>

      {/* Mobile: continuous smooth-scrolling slider */}
      <div
        className="group relative mt-6 -mx-7 overflow-hidden sm:hidden"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <div
          className="animate-marquee flex w-max items-stretch gap-5 px-7 group-hover:[animation-play-state:paused]"
          style={{ animationDuration: "26s" }}
        >
          {[...testimonials, ...testimonials].map((testimonial, i) => (
            <div key={i} className="w-[82vw] max-w-[320px] shrink-0">
              <CourseTestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet / desktop: static grid */}
      <div className="mt-6 hidden gap-5 px-7 sm:grid sm:grid-cols-2">
        {testimonials.map((testimonial, i) => (
          <Reveal key={testimonial.name} delay={i * 90}>
            <CourseTestimonialCard {...testimonial} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
