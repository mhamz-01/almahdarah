import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { StudentLoginForm } from "@/components/student/student-login-form";

export const metadata: Metadata = {
  title: "Student Sign In | Al-Mahdrah Islamic Academy",
  robots: { index: false, follow: false },
};

const rise = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

// A small preview of the week path students see on their dashboard.
const PREVIEW: { day: string; state: "done" | "today" | "next" }[] = [
  { day: "Mon", state: "done" },
  { day: "Tue", state: "done" },
  { day: "Wed", state: "today" },
  { day: "Thu", state: "next" },
];

function WeekPreview() {
  return (
    <div className="rounded-[20px] border border-white/12 bg-white/[0.06] p-5 backdrop-blur-sm">
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-semibold text-white">This week</span>
        <span className="font-mono text-[11px] text-white/60">2 of 4 done</span>
      </div>
      <ol className="relative mt-4 grid grid-cols-4" aria-hidden>
        <span className="absolute top-5 right-[12.5%] left-[12.5%] h-[3px] -translate-y-1/2 rounded-full bg-white/12">
          <span className="wk-fill block h-full w-2/3 rounded-full bg-gradient-to-r from-green to-gold" />
        </span>
        {PREVIEW.map((d, i) => (
          <li key={d.day} className="flex flex-col items-center">
            <span
              className={`wk-node relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold ${
                d.state === "done"
                  ? "bg-green text-white"
                  : d.state === "today"
                    ? "border-2 border-gold bg-navy text-gold"
                    : "border border-white/25 bg-navy text-white/60"
              }`}
              style={{ "--i": i } as CSSProperties}
            >
              {d.state === "today" && <span className="wk-halo absolute inset-0 rounded-full border-2 border-gold" />}
              {d.state === "done" ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path className="wk-tick" d="M5 12.5l4.5 4.5L19 7.5" style={{ "--i": i } as CSSProperties} />
                </svg>
              ) : (
                d.day.slice(0, 1)
              )}
            </span>
            <span className={`mt-2 text-[11px] font-semibold ${d.state === "today" ? "text-gold" : "text-white/70"}`}>
              {d.state === "today" ? "Today" : d.day}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-paper lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* ── Brand panel (desktop) ───────────────────────────────── */}
      <aside className="relative m-3 hidden overflow-hidden rounded-[28px] bg-navy text-white lg:flex lg:flex-col">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(17,130,163,0.55),transparent_60%)]" />
        <div
          aria-hidden
          className="ds-lattice pointer-events-none absolute inset-0 opacity-70 [--pattern:rgba(255,255,255,0.06)] [mask-image:radial-gradient(circle_at_20%_85%,#000_0%,transparent_70%)]"
        />

        <div className="relative flex h-full min-h-0 flex-col justify-between gap-6 p-9 xl:p-11">
          <Link href="/" className="flex w-fit items-center gap-3">
            <Image src="/assets/almahdrah-logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain invert brightness-[1.7]" />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Al-Mahdrah</span>
          </Link>

          <div>
            <div className="ds-rise font-kufi text-[clamp(44px,4.6vw,68px)] leading-none text-gold" style={rise(80)} lang="ar" dir="rtl">
              طلب العلم
            </div>
            <h2
              className="ds-rise mt-6 max-w-[16ch] text-[clamp(34px,3.6vw,52px)] leading-[1.02] font-semibold tracking-[-0.04em]"
              style={rise(180)}
            >
              Your seat in the <span className="text-[#7fd0e6]">majlis.</span>
            </h2>
            <p className="ds-rise mt-5 max-w-[40ch] text-[16px] leading-[1.6] text-white/80" style={rise(280)}>
              Mark your attendance, pick up your lessons where you left off, and keep your week unbroken.
            </p>
            <div className="ds-rise mt-7 max-w-[400px] [@media(max-height:780px)]:hidden" style={rise(400)}>
              <WeekPreview />
            </div>
          </div>

          <figure className="ds-rise max-w-[46ch] border-l-2 border-gold/70 pl-4 [@media(max-height:620px)]:hidden" style={rise(520)}>
            <blockquote className="font-serif text-[16.5px] leading-[1.55] text-white/90 italic">
              “Whoever takes a path seeking knowledge, Allah makes easy for him a path to Paradise.”
            </blockquote>
            <figcaption className="mt-2 font-mono text-[11px] tracking-[0.1em] text-white/55 uppercase">Sahih Muslim</figcaption>
          </figure>
        </div>
      </aside>

      {/* ── Sign-in ─────────────────────────────────────────────── */}
      <main className="relative flex h-dvh flex-col overflow-hidden px-5 py-4 sm:px-10 lg:h-auto lg:min-h-0 lg:py-6">
        <div
          aria-hidden
          className="ds-lattice pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_100%_0%,#000_0%,transparent_55%)] lg:hidden"
        />

        <header className="relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 lg:invisible">
            <Image src="/assets/almahdrah-logo.png" alt="" width={34} height={34} className="h-[34px] w-[34px] object-contain [filter:var(--logo-filter)]" />
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Al-Mahdrah</span>
          </Link>
          <Link href="/" className="rounded-full border border-border px-3.5 py-1.5 text-[13px] font-medium text-text transition-colors hover:border-border-strong hover:text-ink">
            ← Back to site
          </Link>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
          <div className="w-full max-w-[400px]">
            <span className="ds-rise font-mono text-[12px] tracking-[0.1em] text-primary uppercase" style={rise(60)}>
              Student portal
            </span>
            <h1 className="ds-rise mt-3 text-[clamp(30px,4vw,42px)] [@media(max-height:760px)]:text-[30px] leading-[1.02] font-semibold tracking-[-0.04em] text-ink" style={rise(140)}>
              Welcome back.
            </h1>
            <p className="ds-rise mt-2.5 mb-6 text-[14.5px] leading-[1.55] text-text [@media(max-height:660px)]:hidden" style={rise(220)}>
              Sign in with the username and password your teacher gave you when you enrolled.
            </p>

            <div className="ds-rise" style={rise(300)}>
              <StudentLoginForm />
            </div>

            <div className="ds-rise mt-5 grid grid-cols-2 gap-2.5 [@media(max-height:660px)]:mt-4" style={rise(400)}>
              <Link
                href="/student/request-access"
                className="group rounded-[16px] border border-border bg-surface px-3.5 py-3 transition-colors hover:border-primary/50"
              >
                <span className="block text-[12px] text-muted">No account yet?</span>
                <span className="mt-0.5 block text-[14px] font-semibold text-ink">
                  Request access <span className="inline-block text-primary transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
              <Link
                href="/book-a-demo"
                className="group rounded-[16px] border border-border bg-surface px-3.5 py-3 transition-colors hover:border-primary/50"
              >
                <span className="block text-[12px] text-muted">Not enrolled yet?</span>
                <span className="mt-0.5 block text-[14px] font-semibold text-ink">
                  Book a free class <span className="inline-block text-primary transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            </div>
            <p className="mt-4 text-center text-[12.5px] leading-[1.55] text-muted [@media(max-height:760px)]:hidden">
              Forgot your username, or no email on your account? Message your class teacher on WhatsApp.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
