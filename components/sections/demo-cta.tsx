import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function DemoCta() {
  return (
    <section
      id="demo"
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(152deg, var(--primary) 0%, var(--primary-2) 100%)" }}
    >
      <div className="bg-pattern pointer-events-none absolute inset-0 opacity-50" />
      <Image
        src="/assets/almahdrah-logo.png"
        alt=""
        width={300}
        height={300}
        loading="lazy"
        className="pointer-events-none absolute -right-10 -bottom-[50px] w-[300px] opacity-10 invert"
      />

      <div className="relative mx-auto max-w-[1000px] px-7 py-16 text-center text-white sm:py-20 lg:py-[100px]">
        <Reveal>
          <Image
            src="/assets/almahdrah-logo.png"
            alt="Al-Mahdrah"
            width={62}
            height={62}
            loading="lazy"
            className="animate-float mx-auto mb-[22px] h-[62px] w-auto brightness-[1.6] invert"
          />
        </Reveal>
        <Reveal delay={90}>
          <h2 className="mx-auto max-w-[16ch] font-display text-[clamp(32px,4.8vw,58px)] leading-[0.96] tracking-[-0.01em] uppercase text-balance">
            Begin from the ink-pot
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p className="mx-auto mt-[18px] max-w-[50ch] text-[clamp(15px,1.6vw,18px)] opacity-[0.94]">
            Book a free demo class this week and meet a teacher who can guide your
            journey — no payment, no pressure.
          </p>
        </Reveal>
        <Reveal delay={270}>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Button href="/book-a-demo" variant="gold" size="lg" withArrow>
              Book a free demo
            </Button>
            <Button href="#free" variant="invert" size="lg">
              Explore free courses
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
