import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { VisionCard } from "@/components/cards/vision-card";
import { visionPillars } from "@/lib/data/vision";

export function Vision() {
  return (
    <section id="vision" className="scroll-mt-[88px] mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[110px]">
      <div className="max-w-[780px]">
        <Reveal>
          <Eyebrow className="text-green" lineClassName="bg-green">
            Our Vision
          </Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-5 font-serif text-[clamp(23px,2.7vw,35px)] leading-[1.36] text-ink text-pretty">
            To nurture a generation that proudly lives by its{" "}
            <em className="text-primary-2 italic">Islamic identity</em>, acquires
            authentic knowledge from the Qur&apos;an and Sunnah upon the
            understanding of the Sahabah, and stands resilient against the
            intellectual, moral, and spiritual{" "}
            <em className="text-primary-2 italic">fitan</em> of the modern world.
          </p>
        </Reveal>
      </div>

      {/* Desktop / tablet: static grid */}
      <div className="mt-12 hidden gap-[18px] sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {visionPillars.map((pillar, i) => (
          <Reveal key={pillar.number} delay={150 + i * 80}>
            <VisionCard {...pillar} />
          </Reveal>
        ))}
      </div>

      {/* Mobile: continuously auto-scrolling slider */}
      <div
        className="group relative mt-12 -mx-7 overflow-hidden sm:hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
          maskImage:
            "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <div
          className="animate-marquee flex w-max items-stretch gap-[18px] px-7 group-hover:[animation-play-state:paused]"
          style={{ animationDuration: "34s" }}
        >
          {[...visionPillars, ...visionPillars].map((pillar, i) => (
            <div key={i} className="w-[78vw] max-w-[300px] shrink-0">
              <VisionCard {...pillar} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
