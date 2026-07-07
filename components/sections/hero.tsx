import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const stats = [
  { value: "14", label: "structured courses" },
  { value: "1:1", label: "live demo classes" },
  { value: "9", label: "free open courses" },
];

const subjects = [
  "Tajwīd",
  "Classical Arabic",
  "Tafsīr",
  "Hadīth Sciences",
  "Aqīdah",
  "Seerah",
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="bg-pattern pointer-events-none absolute inset-0"
        style={{
          WebkitMaskImage: "radial-gradient(120% 90% at 72% 8%, #000 30%, transparent 76%)",
          maskImage: "radial-gradient(120% 90% at 72% 8%, #000 30%, transparent 76%)",
        }}
      />
      <div
        aria-hidden="true"
        className="animate-blob pointer-events-none absolute -top-16 right-[6%] h-[380px] w-[380px] rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-blob-delay pointer-events-none absolute top-[24%] right-[26%] h-[260px] w-[260px] rounded-full bg-gold/20 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-10 px-7 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-[92px]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-[9px] text-[12.5px] font-bold tracking-[0.2em] text-green uppercase">
              <span className="inline-block h-0.5 w-[22px] bg-green" />
              Al-Mahdrah Academy
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-5 text-[clamp(40px,5.6vw,76px)] leading-[0.94] font-display tracking-[-0.015em] text-ink uppercase text-balance">
              Knowledge that anchors a generation
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 max-w-[40ch] text-[clamp(16px,1.5vw,18.5px)] text-text">
              A premium online academy for Muslim families, homeschoolers, and seekers —
              sacred sciences and the Arabic language, learned with clarity, adab, and
              authentic isnad.
            </p>
          </Reveal>

          <Reveal delay={270}>
            <div className="mt-[30px] flex flex-wrap gap-3">
              <Button href="/book-a-demo" size="lg" withArrow>
                Book a free demo
              </Button>
              <Button href="#free" variant="outline" size="lg">
                Browse free courses
              </Button>
            </div>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-[38px] flex flex-wrap items-center gap-[26px]">
              {stats.map((stat, i) => (
                <div key={stat.label} className="contents">
                  {i > 0 && <span className="h-8 w-px bg-border" />}
                  <div>
                    <div className="font-display text-[30px] text-ink">{stat.value}</div>
                    <div className="text-[12.5px] text-muted">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div
            className="relative flex min-h-[392px] flex-col justify-between overflow-hidden rounded-[26px] p-8 text-white shadow-[var(--shadow-lg)] sm:p-9"
            style={{ background: "linear-gradient(158deg, var(--primary) 0%, var(--primary-2) 100%)" }}
          >
            <Image
              src="/assets/almahdrah-logo.png"
              alt=""
              width={240}
              height={240}
              loading="lazy"
              className="pointer-events-none absolute -top-[26px] -right-[26px] w-60 opacity-10 invert"
            />
            <span className="relative text-[11.5px] tracking-[0.24em] text-white/85 uppercase">
              Our motto
            </span>
            <div className="relative">
              <p className="mb-4 font-serif text-[clamp(27px,3.1vw,40px)] leading-[1.16] text-balance italic">
                &ldquo;From the ink-pot till the grave.&rdquo;
              </p>
              <p className="text-[14.5px] text-white/92">
                — Imam Ahmad ibn Hanbal <span className="opacity-[0.72]">رحمه الله</span>,
                on the lifelong pursuit of knowledge.
              </p>
            </div>
            <div className="relative flex items-center gap-[11px] border-t border-white/20 pt-[22px]">
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-gold text-lg font-extrabold text-[#2b2a26]">
                ٤
              </span>
              <span className="text-[13px] text-white/94">
                Meet a qualified teacher in a free demo class this week.
              </span>
            </div>
          </div>
          <div className="absolute -right-3 -bottom-[18px] flex items-center gap-2.5 rounded-[14px] border border-border bg-surface px-4 py-3 shadow-[var(--shadow-md)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green shadow-[0_0_0_4px_rgba(62,158,84,0.24)]" />
            </span>
            <span className="text-[13px] font-semibold text-fg">
              Taught, never transactional
            </span>
          </div>
        </Reveal>
      </div>

      <div className="border-y border-border bg-surface">
        <div
          className="group overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
            maskImage:
              "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
          }}
        >
          <div className="animate-marquee flex w-max items-center gap-x-[34px] py-[17px] text-[13px] font-semibold tracking-[0.02em] text-muted group-hover:[animation-play-state:paused]">
            {[...subjects, ...subjects].map((subject, i) => (
              <span key={i} className="flex items-center gap-x-[34px]">
                {i > 0 && <span className="text-gold">◆</span>}
                <span>{subject}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
