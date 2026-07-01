import { Eyebrow } from "@/components/ui/eyebrow";
import { VisionCard } from "@/components/cards/vision-card";
import { visionPillars } from "@/lib/data/vision";

export function Vision() {
  return (
    <section id="vision" className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[110px]">
      <div className="max-w-[780px]">
        <Eyebrow className="text-green" lineClassName="bg-green">
          Our Vision
        </Eyebrow>
        <p className="mt-5 font-serif text-[clamp(23px,2.7vw,35px)] leading-[1.36] text-ink text-pretty">
          To nurture a generation that proudly lives by its{" "}
          <em className="text-primary-2 italic">Islamic identity</em>, acquires
          authentic knowledge from the Qur&apos;an and Sunnah upon the
          understanding of the Sahabah, and stands resilient against the
          intellectual, moral, and spiritual{" "}
          <em className="text-primary-2 italic">fitan</em> of the modern world.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {visionPillars.map((pillar) => (
          <VisionCard key={pillar.number} {...pillar} />
        ))}
      </div>
    </section>
  );
}
