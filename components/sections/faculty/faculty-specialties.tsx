import type { FacultyProfile } from "@/lib/types";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { getFacultyFirstName } from "@/lib/faculty-copy";

interface FacultySpecialtiesProps {
  faculty: FacultyProfile;
}

export function FacultySpecialties({ faculty }: FacultySpecialtiesProps) {
  const firstName = getFacultyFirstName(faculty.name);

  return (
    <section className="border-y border-border bg-surface-2">
      <div className="mx-auto max-w-[1160px] px-7 py-16 sm:py-20 lg:py-[76px]">
        <Reveal>
          <Eyebrow className="text-primary-2" lineClassName="bg-primary-2">
            Areas of expertise
          </Eyebrow>
          <h2 className="mt-3.5 font-display text-[clamp(24px,2.8vw,36px)] leading-none tracking-[-0.01em] text-ink uppercase">
            What {firstName} teaches best
          </h2>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {faculty.specialties.map((specialty, i) => (
            <Reveal key={specialty.title} delay={i * 70}>
              <div className="h-full rounded-[18px] border border-border bg-surface p-[22px] transition-shadow duration-200 hover:shadow-[var(--shadow-sm)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 font-display text-base text-primary">
                  {specialty.icon}
                </span>
                <h3 className="mt-3.5 mb-1.5 text-base font-bold text-ink">{specialty.title}</h3>
                <p className="text-[13.5px] leading-[1.55] text-text">{specialty.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
