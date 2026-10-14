"use client";

import { useEffect, useState } from "react";
import { runNotesPipeline, type PipelineProgress } from "@/components/admin/courses/notes-pipeline";
import { LessonNotesReviewDialog } from "@/components/admin/courses/lesson-notes-review-dialog";
import { summarizeNote, type LessonNoteSummary } from "@/lib/lesson-notes/summary";
import type { CourseLessonRow, CourseRow, LessonNoteRow } from "@/lib/types";

interface CourseNotesAdminPanelProps {
  courses: CourseRow[];
  lessons: CourseLessonRow[];
  notes: Record<number, LessonNoteSummary>;
  loadError: string | null;
}

interface Run {
  lessonId: number;
  progress: PipelineProgress;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

function progressLabel(p: PipelineProgress) {
  if (p.phase === "duration") return "Reading video…";
  if (p.phase === "composing") return "Writing notes…";
  const base = `Transcribing ${p.done}/${p.total}`;
  return p.waitingSeconds ? `${base} · busy, retrying in ${p.waitingSeconds}s` : base;
}

function badgeFor(summary: LessonNoteSummary | undefined, run: Run | null) {
  if (run) return { label: progressLabel(run.progress), className: "bg-primary/10 text-primary" };
  if (!summary) return { label: "No notes", className: "bg-surface-2 text-muted" };
  if (summary.status === "failed") return { label: "Failed", className: "bg-red-600/10 text-red-600" };
  if (summary.status !== "ready") {
    return {
      label: `Interrupted · ${summary.segmentsDone}/${summary.segmentsTotal} clips`,
      className: "bg-gold/25 text-[#8a6b12]",
    };
  }
  if (!summary.isPublished) return { label: "Draft · not published", className: "bg-gold/25 text-[#8a6b12]" };
  if (summary.hasUnpublishedChanges) return { label: "Published · edits pending", className: "bg-green/15 text-green" };
  return { label: "Published", className: "bg-green/15 text-green" };
}

const primaryButton =
  "flex h-9 items-center rounded-full bg-primary px-4 text-[12.5px] font-bold whitespace-nowrap text-white transition-colors hover:brightness-[1.07] disabled:opacity-50";
const secondaryButton =
  "flex h-9 items-center rounded-full border-[1.5px] border-border-strong bg-surface px-4 text-[12.5px] font-bold whitespace-nowrap text-text transition-colors hover:border-primary disabled:opacity-50";

export function CourseNotesAdminPanel({ courses, lessons: initialLessons, notes: initialNotes, loadError }: CourseNotesAdminPanelProps) {
  const [lessons, setLessons] = useState(initialLessons);
  const [notes, setNotes] = useState(initialNotes);
  const [courseId, setCourseId] = useState<number | null>(courses[0]?.id ?? null);
  const [run, setRun] = useState<Run | null>(null);
  const [runError, setRunError] = useState<{ lessonId: number; message: string } | null>(null);
  const [reviewId, setReviewId] = useState<number | null>(null);

  // Closing the tab mid-run is safe (Resume picks it up) but almost never intended.
  useEffect(() => {
    if (!run) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [run]);

  const course = courses.find((c) => c.id === courseId) ?? null;
  const courseLessons = lessons.filter((l) => l.course_id === courseId);
  const reviewLesson = lessons.find((l) => l.id === reviewId) ?? null;

  function applyNote(note: LessonNoteRow, segmentsDone = note.segments_total) {
    setNotes((prev) => ({ ...prev, [note.lesson_id]: summarizeNote(note, segmentsDone) }));
  }

  async function generate(lesson: CourseLessonRow, restart: boolean) {
    setRun({ lessonId: lesson.id, progress: { phase: "duration" } });
    setRunError(null);
    let segments = { done: 0, total: 0 };
    try {
      const { note, durationSeconds } = await runNotesPipeline(lesson, {
        restart,
        onProgress: (progress) => {
          if (progress.phase === "transcribing") segments = { done: progress.done, total: progress.total };
          setRun({ lessonId: lesson.id, progress });
        },
      });
      applyNote(note);
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, duration_seconds: durationSeconds } : l)));
      setReviewId(lesson.id);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Generation failed";
      setRunError({ lessonId: lesson.id, message });
      // Reflect how far it got, so the row offers "Resume".
      setNotes((prev) => ({
        ...prev,
        [lesson.id]: {
          ...(prev[lesson.id] ?? {
            hasDraft: false,
            isPublished: false,
            hasUnpublishedChanges: false,
            generatedAt: null,
            publishedAt: null,
          }),
          status: "failed",
          error: message,
          segmentsDone: segments.done,
          segmentsTotal: segments.total,
        },
      }));
    } finally {
      setRun(null);
    }
  }

  const publishedCount = (c: CourseRow) =>
    lessons.filter((l) => l.course_id === c.id && notes[l.id]?.isPublished).length;
  const lessonCount = (c: CourseRow) => lessons.filter((l) => l.course_id === c.id).length;

  return (
    <div>
      <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">Lecture notes</h1>
      <p className="mt-2 max-w-[680px] text-[14px] leading-[1.6] text-text">
        Generate study notes from a lesson&apos;s video, review and edit them, then publish. Students only see
        published notes, under the video in their course player.
      </p>

      {loadError && (
        <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          Couldn&apos;t load courses: {loadError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {courses.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCourseId(c.id)}
            className={`flex h-9 items-center gap-2 rounded-full border-[1.5px] px-4 text-[12.5px] font-bold transition-colors ${
              c.id === courseId ? "border-primary bg-primary text-white" : "border-border-strong bg-surface text-text hover:border-primary"
            }`}
          >
            {c.title}
            <span className={`font-mono text-[10.5px] ${c.id === courseId ? "text-white/80" : "text-muted"}`}>
              {publishedCount(c)}/{lessonCount(c)}
            </span>
          </button>
        ))}
      </div>

      {course && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
          {courseLessons.length === 0 && <p className="px-5 py-8 text-center text-muted">This course has no lessons yet.</p>}
          {courseLessons.map((lesson) => {
            const summary = notes[lesson.id];
            const activeRun = run?.lessonId === lesson.id ? run : null;
            const badge = badgeFor(summary, activeRun);
            const error = runError?.lessonId === lesson.id ? runError.message : summary?.status === "failed" ? summary.error : null;
            const busy = run !== null;
            return (
              <div key={lesson.id} className="border-b border-border px-5 py-3.5 last:border-b-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="w-7 shrink-0 font-mono text-[11px] text-muted">{lesson.position}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold text-ink">{lesson.title}</div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-muted">
                      {formatDuration(lesson.duration_seconds)}
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.className}`}>{badge.label}</span>
                  <div className="flex gap-2">
                    {!summary && (
                      <button type="button" disabled={busy} onClick={() => generate(lesson, false)} className={primaryButton}>
                        Generate notes
                      </button>
                    )}
                    {summary && summary.status !== "ready" && !activeRun && (
                      <button type="button" disabled={busy} onClick={() => generate(lesson, false)} className={primaryButton}>
                        Resume
                      </button>
                    )}
                    {summary?.hasDraft && !activeRun && (
                      <button type="button" onClick={() => setReviewId(lesson.id)} className={secondaryButton}>
                        Review
                      </button>
                    )}
                  </div>
                </div>
                {error && !activeRun && <p className="mt-2 pl-11 text-[12px] font-semibold text-red-600">{error}</p>}
              </div>
            );
          })}
        </div>
      )}

      {reviewLesson && course && (
        <LessonNotesReviewDialog
          key={reviewLesson.id}
          lesson={reviewLesson}
          courseTitle={courses.find((c) => c.id === reviewLesson.course_id)?.title ?? course.title}
          open
          onOpenChange={(open) => !open && setReviewId(null)}
          onNoteChange={(note) => applyNote(note)}
          regenerateDisabled={run !== null}
          onRegenerate={() => {
            setReviewId(null);
            void generate(reviewLesson, true);
          }}
        />
      )}
    </div>
  );
}
