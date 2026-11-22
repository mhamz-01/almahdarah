import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { FreeLibrary } from "./free-library";
import { Schedule, type ClassSlot } from "./schedule";
import { Programmes } from "./programmes";
import { faculty } from "@/lib/data/faculty";
import { freeCourses, mentoredCourses } from "@/lib/data/courses";
import { freeCourseExtras } from "@/lib/data/home-v2-free";
import { getPublishedReviews } from "@/lib/supabase";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/config";
import { ParticleField } from "./particle-field";

const label = "block font-mono text-xs tracking-[0.1em] text-primary";
const h2 =
  "mt-[18px] text-[clamp(34px,4.6vw,60px)] leading-[1.02] font-semibold tracking-[-0.04em] text-ink";
const lede = "max-w-[38ch] text-[16.5px] leading-[1.6] text-text";
const wrap = "mx-auto max-w-[1200px] px-7 py-[clamp(100px,13vw,160px)]";

export function FreeSection() {
  const items = freeCourses.map((c) => {
    const x = freeCourseExtras(c.slug);
    return {
      slug: c.slug,
      title: c.title,
      subject: x.subject,
      ar: x.ar,
      by: x.by,
      desc: c.description,
      schedule: c.schedule,
      duration: c.duration,
      live: !!c.live,
      image: x.image,
    };
  });

  return (
    <section
      id="free"
      className="relative isolate scroll-mt-0 overflow-hidden border-t border-border"
    >
      <ParticleField
        formation="live"
        place={{ x: 0.66, top: 210, size: 0.34 }}
        count={1000}
        opacity={0.5}
        className="hidden md:block"
      />

      <div className={wrap}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <span className={label}>THE JOURNEY</span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className={`${h2} max-w-[15ch]`}>
                Every class is a step on the path.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <p className={lede}>
              Every course follows a classical text from its first page, with
              live weekly classes and full recorded series. Find the step that
              fits where you are, and walk it alongside others who are doing
              the same.
            </p>
          </Reveal>
        </div>
        <FreeLibrary items={items} />
      </div>
    </section>
  );
}

export function ProgrammesSection() {
  return (
    <section
      id="programmes"
      className="relative isolate overflow-hidden border-t border-border"
    >
      <ParticleField
        formation="steps"
        place={{ x: 0.66, top: 210, size: 0.34 }}
        count={1000}
        opacity={0.5}
        className="hidden md:block"
      />

      <div className={wrap}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <span className={label}>MENTORED PROGRAMMES</span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className={`${h2} max-w-[16ch]`}>
                Guided courses with a teacher.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <p className={lede}>
              A teacher who knows your level, your pace and your questions.
              Start with a free demo class; if it&apos;s the right fit, tuition
              is arranged directly with your teacher — never on the platform.
            </p>
          </Reveal>
        </div>
        <Programmes courses={mentoredCourses} />
      </div>
    </section>
  );
}

const DAY_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const dayOf = (schedule: string) => {
  const m = schedule.match(
    /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*(?:\s*&\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*)?/i,
  );
  return m
    ? [m[1], m[2]].filter(Boolean).map((d) => d!.slice(0, 3).toUpperCase())
    : [];
};
const weekColors = ["#1182A3", "#0E2A47", "#6B7A89", "#C9A24A"];

/** Built from the live courses so the timetable can't drift from the course data. Days off are not shown. */
export function RhythmSection() {
  const slots: ClassSlot[] = freeCourses
    .filter((c) => c.live)
    .flatMap((c, ci) => {
      const x = freeCourseExtras(c.slug);
      return dayOf(c.schedule)
        .filter((d) => DAY_ORDER.includes(d))
        .map((d) => ({
          slug: c.slug,
          title: c.title,
          subject: x.subject,
          ar: x.ar,
          dayIdx: DAY_ORDER.indexOf(d),
          color: weekColors[ci % weekColors.length],
        }));
    });

  if (slots.length === 0) return null;
  return <Schedule slots={slots} />;
}

const initials = (name: string) =>
  name
    .replace(/^(Ustadh|Ustadhah|Shaykh|Sheikh)\s+/i, "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(bin|ur|al)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export function TeachersSection() {
  return (
    <section
      id="teachers"
      className="relative isolate overflow-hidden border-t border-border"
    >
      <ParticleField
        formation="mentor"
        place={{ x: 0.66, top: 210, size: 0.34 }}
        count={1000}
        opacity={0.5}
        className="hidden md:block"
      />

      <div className={wrap}>
        <Reveal>
          <span className={label}>THE TEACHERS</span>
        </Reveal>
        <Reveal delay={100}>
          <h2 className={`${h2} max-w-[18ch]`}>
            Taught by people who were taught.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.6] text-text">
            Teachers with sound credentials, a sound manhaj and gentle adab —
            chosen for both what they know and how they pass it on.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {faculty.map((t, i) => (
            <Reveal key={t.slug} delay={i * 90}>
              <Link
                href={`/faculty/${t.slug}`}
                className="group block transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-[5px]"
              >
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[14px] bg-mist">
                  <div
                    aria-hidden
                    className="ds-lattice absolute inset-0 [mask-image:radial-gradient(circle_at_70%_20%,#000,transparent_65%)]"
                  />
                  <span className="relative font-kufi text-[88px] leading-none text-accent opacity-90">
                    {initials(t.name)}
                  </span>
                </div>
                <div className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-ink">
                  {t.name}
                </div>
                <div className="mt-1 font-mono text-[11.5px] tracking-[0.06em] text-primary uppercase">
                  {t.subject}
                </div>
                <div className="mt-2 text-sm leading-[1.55] text-muted">
                  {t.bio}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function ProofSection() {
  const { data } = await getPublishedReviews();
  const reviews = data ?? [];
  if (reviews.length === 0) return null;

  const [lead, ...rest] = reviews;
  const more = rest.slice(0, 2);

  return (
    <section className="relative isolate overflow-hidden border-t border-border bg-surface">
      <ParticleField
        formation="quote"
        place={{ x: -0.72, top: 200, size: 0.3 }}
        count={1000}
        opacity={0.5}
        className="hidden md:block"
      />

      <div className={wrap}>
        <Reveal>
          <span className={label}>FROM OUR STUDENTS & PARENTS</span>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-[26px] max-w-[26ch] text-[clamp(28px,4.2vw,56px)] leading-[1.1] font-medium tracking-[-0.035em] text-balance text-ink">
            “{lead.review_text}”
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-[22px] text-[15px] text-muted">
            {lead.name} · {lead.city}, {lead.country}
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-[minmax(0,1fr)] items-stretch gap-5 md:grid-cols-[repeat(2,minmax(0,1fr))_auto]">
          {more.map((r, i) => (
            <Reveal key={r.id ?? i} delay={100 + i * 100} className="h-full">
              <div className="h-full rounded-[14px] border border-border bg-paper p-7">
                <p className="line-clamp-6 text-[17px] leading-[1.6] text-ink">
                  “{r.review_text}”
                </p>
                <div className="mt-[18px] text-[13.5px] text-muted">
                  {r.name} · {r.city}, {r.country}
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={300} className="h-full">
            <Link
              href="/reviews"
              className="flex h-full min-h-[96px] min-w-[180px] items-center justify-center rounded-[14px] border border-dashed border-border-strong p-7 text-[15px] font-semibold text-ink transition-all duration-200 hover:border-primary hover:text-primary"
            >
              All reviews →
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function SalafSection() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border">
      <ParticleField
        formation="chain"
        place={{ x: 0, y: 0, size: 0.5 }}
        count={1100}
        opacity={0.5}
      />
      <div
        aria-hidden
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_70%)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,var(--pattern) 0 1px,transparent 1px 56px),repeating-linear-gradient(-45deg,var(--pattern) 0 1px,transparent 1px 56px)",
        }}
      />
      <div className="relative mx-auto max-w-[900px] px-7 py-[clamp(110px,14vw,180px)] text-center">
        <Reveal>
          <span className="block font-kufi text-[56px] leading-none text-accent">
            علم
          </span>
        </Reveal>
        <Reveal delay={150}>
          <p className="mx-auto mt-[30px] max-w-[26ch] font-serif text-[clamp(28px,3.6vw,46px)] leading-[1.25] text-balance text-ink italic">
            “Indeed, this knowledge is religion — so look to whom you take your
            religion from.”
          </p>
        </Reveal>
        <Reveal delay={250}>
          <div className="mt-6 text-[14.5px] text-muted">
            Muḥammad ibn Sīrīn · d. 110 AH · narrated in the introduction to
            Ṣaḥīḥ Muslim
          </div>
        </Reveal>
        <Reveal delay={350}>
          <Link
            href="/quotes"
            className="mt-[30px] inline-flex text-[14.5px] font-semibold text-primary transition-colors hover:text-ink"
          >
            More words of the Salaf →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section
      id="demo"
      className="relative isolate overflow-hidden bg-[#0E2A47]"
    >
      <ParticleField
        formation="logo"
        onDark
        place={{ x: 0.56, y: 0, size: 0.78 }}
        count={2800}
        opacity={0.8}
      />
      <div
        aria-hidden
        className="absolute -top-[40%] -right-[10%] aspect-square w-[70%] rounded-full [mask-image:radial-gradient(circle,#000_30%,transparent_70%)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 1px,transparent 1px 48px),repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 1px,transparent 1px 48px)",
        }}
      />
      <div className="relative mx-auto max-w-[1200px] px-7 py-[clamp(110px,14vw,180px)]">
        <Reveal>
          <span className="block font-mono text-xs tracking-[0.1em] text-[#C9A24A]">
            BEGIN
          </span>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mt-5 max-w-[14ch] text-[clamp(42px,6.4vw,92px)] leading-[0.98] font-semibold tracking-[-0.045em] text-white">
            Your first class is free. Sit in. Then decide.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-[26px] max-w-[46ch] text-lg leading-[1.6] text-[#B9C4CF]">
            Tell us where you are — a complete beginner, or someone who has been
            studying in fragments — and we&apos;ll place you at the right level
            with a real teacher. No payment details, no pressure. Just the
            class.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-[38px] flex flex-wrap gap-3">
            <Link
              href="/book-a-demo"
              className="inline-flex h-[58px] items-center gap-3 rounded-full bg-[#3BA6C6] px-[30px] text-[16.5px] font-semibold text-[#0B1622] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(59,166,198,.8)]"
            >
              Book your free class <span className="text-lg">→</span>
            </Link>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[58px] items-center rounded-full border border-white/25 px-6 text-base font-medium text-white transition-colors hover:border-white"
            >
              Join the WhatsApp community
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const footCols = [
  {
    heading: "STUDY",
    links: [
      { label: "Free courses", href: "/#free" },
      { label: "Mentored programmes", href: "/#programmes" },
      { label: "Book a free class", href: "/book-a-demo" },
    ],
  },
  {
    heading: "READ",
    links: [
      { label: "Words of the Salaf", href: "/quotes" },
      { label: "Reviews", href: "/reviews" },
      { label: "Share a review", href: "/review" },
    ],
  },
  {
    heading: "STUDENTS",
    links: [
      { label: "Student login", href: "/student/login" },
      { label: "Teachers", href: "/#teachers" },
    ],
  },
];

export function HomeFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-8 px-7 pt-16 pb-10 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/assets/almahdrah-logo.png"
              alt=""
              width={28}
              height={28}
              loading="lazy"
              className="h-7 w-auto [filter:var(--logo-filter)]"
            />
            <span className="text-base font-bold tracking-[-0.02em] text-ink">
              Al-Mahdrah
            </span>
          </div>
          <p className="mt-4 max-w-[32ch] text-sm leading-[1.6] text-muted">
            An academy for studying deen seriously, part-time.
          </p>
        </div>
        {footCols.map((c) => (
          <div key={c.heading} className="flex flex-col gap-2.5 text-sm">
            <span className="font-mono text-[11px] tracking-[0.1em] text-muted">
              {c.heading}
            </span>
            {c.links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-text transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-2.5 border-t border-border px-7 pt-5 pb-8 text-[12.5px] text-muted">
        <span>© {new Date().getFullYear()} Al-Mahdrah Islamic Academy</span>
        <span>
          Tuition arranged directly with teachers — never on-platform.
        </span>
      </div>
    </footer>
  );
}
