import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { getPublishedReviews } from "@/lib/supabase";
import { HeroStage } from "./hero-stage";

const words = ["Study", "deen"];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function Star() {
  return (
    <svg viewBox="0 0 20 20" className="h-[22px] w-[22px] sm:h-6 sm:w-6" aria-hidden>
      <path
        d="M10 1.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.6 4.8 17.5 6 11.7 1.6 7.7l5.9-.7z"
        fill="var(--gold, #d9a932)"
      />
    </svg>
  );
}

function Stars() {
  return (
    <div className="flex items-center justify-center gap-1" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} />
      ))}
    </div>
  );
}

/** Five stars, with the real average and count from the approved reviews once they load. */
async function HeroRating() {
  const { data } = await getPublishedReviews();
  const rated = (data ?? []).filter((r) => r.rating >= 1);
  if (rated.length === 0) return <Stars />;
  const avg = rated.reduce((t, r) => t + r.rating, 0) / rated.length;

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={`Rated ${avg.toFixed(1)} out of 5 by ${rated.length} students and parents`}
    >
      <Stars />
      <p className="text-[14px] text-text sm:text-[14.5px]">
        <b className="font-semibold text-ink">{avg.toFixed(1)}</b> from{" "}
        {rated.length} students &amp; parents
      </p>
    </div>
  );
}

/** The name assembles, glides right, and the message follows on the left. */
export function HomeHero() {
  return (
    <HeroStage>
      <div className="relative mx-auto flex w-full max-w-[1280px] justify-center px-5 pt-[120px] pb-20 sm:px-7 sm:pt-[130px] sm:pb-24 lg:pt-[110px] lg:pb-[104px]">
        <div className="flex min-w-0 flex-col items-center text-center">
          <h1 className="text-[clamp(52px,16vw,84px)] leading-[0.96] font-semibold tracking-[-0.05em] text-ink sm:text-[clamp(84px,12vw,120px)] lg:text-[clamp(96px,10vw,148px)]">
            {words.map((w, i) => (
              <span
                key={w}
                className="ds-rise mr-[0.2em] inline-block"
                style={delay(120 + i * 90)}
              >
                {w}
              </span>
            ))}
            <span
              className="ds-rise block text-primary"
              style={delay(120 + words.length * 90 + 80)}
            >
              rigorously.
            </span>
          </h1>

          <p
            className="ds-rise mt-6 max-w-[30ch] text-[19px] leading-[1.45] font-medium text-text sm:mt-7 sm:text-[22px] lg:text-[24px]"
            style={delay(650)}
          >
            Classical texts. Qualified teachers. One clear path.
          </p>

          <div
            className="ds-rise mt-8 flex w-full max-w-[420px] flex-col items-stretch sm:mt-10 sm:w-auto sm:max-w-none"
            style={delay(800)}
          >
            <Link
              href="/book-a-demo"
              className="inline-flex h-[54px] items-center justify-center gap-3 rounded-full bg-primary px-8 text-[15.5px] font-semibold text-primary-ink transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-14px_rgba(17,130,163,.75)] sm:h-14 sm:text-base"
            >
              Book your free class <span className="text-lg">→</span>
            </Link>
          </div>

          <div className="ds-rise mt-6 sm:mt-7" style={delay(950)}>
            <Suspense fallback={<Stars />}>
              <HeroRating />
            </Suspense>
          </div>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-3 left-1/2 -translate-x-1/2 text-muted md:hidden">
        <svg viewBox="0 0 24 24" className="h-5 w-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2.5 md:flex">
        <span className="font-mono text-[10.5px] tracking-[0.2em] text-muted">
          SCROLL
        </span>
        <span className="block h-9 w-px animate-[ds-cue_2.4s_cubic-bezier(.6,0,.2,1)_infinite] bg-ink opacity-50" />
      </div>
    </HeroStage>
  );
}
