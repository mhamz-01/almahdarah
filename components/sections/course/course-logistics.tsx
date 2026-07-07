import type { CourseDetail } from "@/lib/types";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { CheckGlyph } from "@/components/ui/check-glyph";

interface CourseLogisticsProps {
  logistics: CourseDetail["logistics"];
  audience: CourseDetail["audience"];
}

export function CourseLogistics({ logistics, audience }: CourseLogisticsProps) {
  return (
    <section className="border-y border-border bg-surface-2">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-7 py-16 sm:py-20 lg:grid-cols-2 lg:py-[96px]">
        <div>
          <Reveal>
            <Eyebrow className="text-primary" lineClassName="bg-primary">
              Format &amp; logistics
            </Eyebrow>
            <h2 className="mt-3.5 mb-[22px] font-display text-[clamp(24px,2.8vw,34px)] leading-none tracking-[-0.01em] text-ink uppercase">
              How classes run
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <div className="flex flex-col overflow-hidden rounded-[18px] border border-border bg-surface">
              {logistics.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0"
                >
                  <span className="text-[13.5px] font-semibold text-muted">{row.label}</span>
                  <span className="text-right text-[13.5px] font-bold text-ink">{row.value}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal delay={60}>
            <Eyebrow className="text-green" lineClassName="bg-green">
              Who this is for
            </Eyebrow>
            <h2 className="mt-3.5 mb-[22px] font-display text-[clamp(24px,2.8vw,34px)] leading-none tracking-[-0.01em] text-ink uppercase">
              Built for your family
            </h2>
          </Reveal>
          <div className="flex flex-col gap-3">
            {audience.map((item, i) => (
              <Reveal key={item} delay={150 + i * 60}>
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-[18px] py-4">
                  <CheckGlyph size={22} className="mt-0.5" />
                  <span className="text-sm leading-[1.5] text-text">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
