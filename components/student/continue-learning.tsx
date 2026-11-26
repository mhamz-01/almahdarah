import Link from "next/link";
import type { CourseLessonRow } from "@/lib/types";

export type ResumeLesson = Pick<CourseLessonRow, "id" | "position" | "title" | "youtube_video_id" | "duration_seconds">;

export interface ResumeCard {
  mode: "resume" | "next" | "start" | "finished";
  courseId: number;
  courseTitle: string;
  lesson: ResumeLesson | null;
  seconds: number;
  done: number;
  total: number;
}

function clock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

const shell = "flex h-full flex-col rounded-[22px] border border-border bg-surface p-4 sm:p-5";

/** The dashboard's "Continue learning" card: one big tap target that opens the lesson. */
export function ContinueLearning({ resume }: { resume: ResumeCard | null }) {
  if (!resume) {
    return (
      <div className={shell}>
        <Eyebrow>Learn</Eyebrow>
        <p className="mt-3 text-[14px] text-muted">No courses are available yet. Check back soon, in sha Allah.</p>
      </div>
    );
  }

  if (resume.mode === "finished" || !resume.lesson) {
    return (
      <div className={`${shell} justify-between gap-5`}>
        <div>
          <Eyebrow>Course complete</Eyebrow>
          <h2 className="mt-2 text-[19px] leading-[1.25] font-bold text-ink">Masha’Allah, you finished {resume.courseTitle}.</h2>
          <p className="mt-1.5 text-[13.5px] text-text">All {resume.total} lessons done. Pick what to study next.</p>
        </div>
        <Link href="/student/courses" className="inline-flex h-10 w-fit items-center rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition hover:brightness-[1.08]">
          Browse courses →
        </Link>
      </div>
    );
  }

  const { lesson } = resume;
  const watchedPct =
    resume.mode === "resume" && lesson.duration_seconds ? Math.min(100, Math.round((resume.seconds / lesson.duration_seconds) * 100)) : 0;
  const coursePct = resume.total ? Math.round((resume.done / resume.total) * 100) : 0;
  const cta = resume.mode === "resume" ? "Resume lesson" : resume.mode === "next" ? "Start next lesson" : "Start first lesson";
  const eyebrow = resume.mode === "start" ? "Start learning" : resume.mode === "next" ? "Up next" : "Continue learning";

  return (
    <Link
      href={`/student/courses/${resume.courseId}?lesson=${lesson.position}`}
      className={`${shell} group gap-4 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-[var(--shadow-sm)] sm:flex-row sm:items-stretch sm:gap-5`}
    >
      {/* Thumbnail with play button and how far into the lesson they are */}
      <span className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-[14px] bg-surface-2 sm:aspect-auto sm:w-[46%] sm:min-h-[168px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${lesson.youtube_video_id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy shadow-lg transition-transform duration-300 group-hover:scale-110"
        >
          <PlayIcon />
        </span>
        {resume.mode === "resume" && resume.seconds > 0 && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[11px] text-white">
            {clock(resume.seconds)}
            {lesson.duration_seconds ? ` / ${clock(lesson.duration_seconds)}` : ""}
          </span>
        )}
        {watchedPct > 0 && (
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
            <span className="block h-full bg-primary" style={{ width: `${watchedPct}%` }} />
          </span>
        )}
      </span>

      {/* Details */}
      <span className="flex min-w-0 flex-1 flex-col">
        <Eyebrow>{eyebrow}</Eyebrow>
        <span className="mt-2 block truncate text-[12.5px] font-semibold text-muted">{resume.courseTitle}</span>
        <span className="mt-1 line-clamp-2 block text-[17px] leading-[1.3] font-bold text-ink sm:text-[18px]">{lesson.title}</span>
        <span className="mt-1.5 block font-mono text-[11px] text-muted">
          Lesson {lesson.position}
          {resume.total > 0 ? ` of ${resume.total}` : ""}
          {resume.mode === "resume" && resume.seconds > 0 ? ` · left off at ${clock(resume.seconds)}` : ""}
        </span>

        <span className="mt-auto block pt-4">
          {resume.total > 0 && (
            <span className="mb-3.5 block">
              <span className="flex items-baseline justify-between text-[12px]">
                <span className="text-muted">Course progress</span>
                <span className="font-bold text-ink">{coursePct}%</span>
              </span>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-2">
                <span className="wk-fill block h-full rounded-full bg-primary" style={{ width: `${coursePct}%` }} />
              </span>
            </span>
          )}
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition group-hover:brightness-[1.08]">
            {cta}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </span>
      </span>
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="block font-mono text-[11px] tracking-[0.12em] text-primary uppercase">{children}</span>;
}
