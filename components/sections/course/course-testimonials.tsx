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
    <section className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[96px]">
      <Reveal>
        <Eyebrow className="text-primary" lineClassName="bg-primary">
          From students &amp; parents
        </Eyebrow>
      </Reveal>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {testimonials.map((testimonial, i) => (
          <Reveal key={testimonial.name} delay={i * 90}>
            <CourseTestimonialCard {...testimonial} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
