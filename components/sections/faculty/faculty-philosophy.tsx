import Image from "next/image";
import type { FacultyProfile } from "@/lib/types";
import { Reveal } from "@/components/ui/reveal";

interface FacultyPhilosophyProps {
  faculty: FacultyProfile;
}

export function FacultyPhilosophy({ faculty }: FacultyPhilosophyProps) {
  return (
    <section className="relative overflow-hidden bg-navy">
      <Image
        src="/assets/almahdrah-logo.png"
        alt=""
        width={220}
        height={220}
        loading="lazy"
        className="pointer-events-none absolute -top-8 -left-10 w-[220px] opacity-[0.07] invert"
      />
      <div className="relative mx-auto max-w-[820px] px-7 py-16 text-center text-white sm:py-20 lg:py-[92px]">
        <Reveal>
          <span className="text-base tracking-[2px] text-gold">★★★★★</span>
          <p className="mt-[18px] font-serif text-[clamp(20px,2.4vw,30px)] leading-[1.45] font-medium italic">
            &ldquo;{faculty.philosophyQuote}&rdquo;
          </p>
          <div className="mt-5 text-sm text-white/75">
            — {faculty.name}, {faculty.role}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
