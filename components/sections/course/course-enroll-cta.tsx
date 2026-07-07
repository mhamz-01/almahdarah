import Image from "next/image";
import type { CourseDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { JoinCommunityDialog } from "@/components/community/join-community-dialog";
import { getBookingHref, getCourseCopy } from "@/lib/course-copy";

interface CourseEnrollCtaProps {
  course: CourseDetail;
}

export function CourseEnrollCta({ course }: CourseEnrollCtaProps) {
  const copy = getCourseCopy(course.type);

  return (
    <section
      id="enroll"
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, var(--primary) 0%, var(--primary-2) 100%)" }}
    >
      <div className="bg-pattern pointer-events-none absolute inset-0 opacity-50" />
      <Image
        src="/assets/almahdrah-logo.png"
        alt=""
        width={280}
        height={280}
        loading="lazy"
        className="pointer-events-none absolute -right-10 -bottom-[50px] w-[280px] opacity-10 invert"
      />

      <div className="relative mx-auto max-w-[1000px] px-7 py-16 text-center text-white sm:py-20 lg:py-[92px]">
        <Reveal>
          <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(28px,4vw,46px)] leading-[1] tracking-[-0.01em] uppercase">
            {course.ctaHeadline}
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mx-auto mt-4 max-w-[52ch] text-[clamp(15px,1.5vw,17.5px)] opacity-[0.94]">{course.ctaSub}</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {course.steps.map((step, i) => (
            <Reveal key={step.title} delay={180 + i * 90}>
              <div className="rounded-[18px] border border-white/20 bg-white/10 p-[22px]">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gold font-display text-sm text-[#2b2a26]">
                  {step.num}
                </span>
                <h3 className="mt-3.5 mb-1.5 text-[15.5px] font-bold">{step.title}</h3>
                <p className="text-[13.5px] leading-[1.5] text-white/82">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={450}>
          <div className="mt-9">
            {copy.isPaid ? (
              <Button href={getBookingHref(course)} variant="gold" size="lg" withArrow>
                {copy.heroCtaLabel}
              </Button>
            ) : (
              <JoinCommunityDialog courseTitle={course.title}>
                <Button variant="gold" size="lg" withArrow>
                  {copy.heroCtaLabel}
                </Button>
              </JoinCommunityDialog>
            )}
          </div>
          <p className="mt-3.5 text-[12.5px] opacity-80">{copy.priceLine}</p>
        </Reveal>
      </div>
    </section>
  );
}
