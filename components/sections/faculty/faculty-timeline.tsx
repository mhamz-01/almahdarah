import type { FacultyTimelineEntry } from "@/lib/types";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";

interface FacultyTimelineProps {
  timeline: FacultyTimelineEntry[];
}

export function FacultyTimeline({ timeline }: FacultyTimelineProps) {
  return (
    <section className="mx-auto max-w-[900px] px-7 py-16 sm:py-20 lg:py-[92px]">
      <Reveal>
        <Eyebrow className="text-green" lineClassName="bg-green">
          Journey &amp; Ijāzah
        </Eyebrow>
        <h2 className="mt-3.5 font-display text-[clamp(24px,2.8vw,36px)] leading-none tracking-[-0.01em] text-ink uppercase">
          A grounded chain of learning
        </h2>
      </Reveal>

      <div className="mt-8 flex flex-col">
        {timeline.map((entry, i) => (
          <Reveal key={entry.year} delay={i * 80}>
            <div className="grid grid-cols-[64px_1fr] gap-5 sm:grid-cols-[88px_1fr]">
              <div className="flex flex-col items-center">
                <span className="mt-0.5 font-mono text-[12.5px] font-semibold text-muted">{entry.year}</span>
                <span className="my-2.5 h-3 w-3 shrink-0 rounded-full bg-primary shadow-[0_0_0_4px_rgba(17,130,163,0.18)]" />
                {i < timeline.length - 1 && <span className="w-0.5 flex-1 bg-border" />}
              </div>
              <div className="pb-[30px]">
                <h3 className="mb-1.5 text-[15.5px] font-bold text-ink">{entry.title}</h3>
                <p className="text-sm leading-[1.6] text-text">{entry.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
