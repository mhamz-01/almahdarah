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
    <section id="enroll" className="relative isolate overflow-hidden bg-[#0E2A47]">
      <div
        aria-hidden
        className="absolute -top-[40%] -right-[10%] aspect-square w-[70%] rounded-full [mask-image:radial-gradient(circle,#000_30%,transparent_70%)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 1px,transparent 1px 48px),repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 1px,transparent 1px 48px)",
        }}
      />

      <div className="relative mx-auto max-w-[1000px] px-7 py-[clamp(72px,10vw,128px)] text-center text-white">
        <Reveal>
          <h2 className="mx-auto max-w-[18ch] text-[clamp(34px,5vw,60px)] leading-[1] font-semibold tracking-[-0.045em] text-balance">
            {course.ctaHeadline}
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mx-auto mt-5 max-w-[52ch] text-[clamp(16px,1.5vw,18px)] leading-[1.6] text-[#B9C4CF]">{course.ctaSub}</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {course.steps.map((step, i) => (
            <Reveal key={step.title} delay={180 + i * 90}>
              <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-[22px]">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#C9A24A] font-mono text-sm text-[#0B1622]">
                  {step.num}
                </span>
                <h3 className="mt-3.5 mb-1.5 text-[16px] font-semibold">{step.title}</h3>
                <p className="text-[13.5px] leading-[1.5] text-[#B9C4CF]">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={450}>
          <div className="mt-9">
            {copy.isPaid ? (
              <Button href={getBookingHref(course)} variant="primary" size="lg" withArrow className="!bg-[#3BA6C6] !text-[#0B1622]">
                {copy.heroCtaLabel}
              </Button>
            ) : (
              <JoinCommunityDialog courseTitle={course.title}>
                <Button variant="primary" size="lg" withArrow className="!bg-[#3BA6C6] !text-[#0B1622]">
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
