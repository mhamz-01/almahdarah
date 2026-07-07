import Image from "next/image";
import { Button } from "@/components/ui/button";

export function ArticleCta() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, var(--primary) 0%, var(--primary-2) 100%)" }}
    >
      <div className="bg-pattern pointer-events-none absolute inset-0 opacity-50" />
      <Image
        src="/assets/almahdrah-logo.png"
        alt=""
        width={260}
        height={260}
        loading="lazy"
        className="pointer-events-none absolute -right-10 -bottom-[50px] w-[260px] opacity-10 invert"
      />

      <div className="relative mx-auto max-w-[820px] px-7 py-16 text-center text-white sm:py-20">
        <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(24px,3.2vw,38px)] leading-[1.05] tracking-[-0.01em] uppercase">
          Continue the journey with us
        </h2>
        <p className="mx-auto mt-3.5 max-w-[52ch] text-[15px] opacity-[0.92]">
          Meet a teacher in a free demo class — no payment, no pressure, just a first step.
        </p>
        <div className="mt-[26px] flex flex-wrap justify-center gap-3">
          <Button href="/book-a-demo" variant="gold" size="md">
            Book a free demo
          </Button>
          <Button href="/#free" variant="invert" size="md">
            Browse free courses
          </Button>
        </div>
      </div>
    </section>
  );
}
