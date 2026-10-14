"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CourseLessonRow, LessonProgressRow } from "@/lib/types";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube-iframe";
import { LectureNotes } from "@/components/notes/lecture-notes";

// Player states from the IFrame API.
const STATE_ENDED = 0;
const STATE_PLAYING = 1;
const STATE_PAUSED = 2;

interface CoursePlayerProps {
  lessons: CourseLessonRow[];
  progress: LessonProgressRow[];
  // Published lecture notes (Markdown), keyed by lesson id.
  notes: Record<number, string>;
  initialLessonId: number;
}

export function CoursePlayer({ lessons, progress, notes, initialLessonId }: CoursePlayerProps) {
  const [currentId, setCurrentId] = useState(initialLessonId);
  const [done, setDone] = useState(() => new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id)));
  const positions = useRef(new Map(progress.map((p) => [p.lesson_id, p.last_position_seconds])));

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const currentIdRef = useRef(currentId);
  const lessonsRef = useRef(lessons);

  const current = lessons.find((l) => l.id === currentId) ?? lessons[0];
  const currentIndex = lessons.findIndex((l) => l.id === current.id);

  const save = useCallback((lessonId: number, completed = false, keepalive = false) => {
    const position = playerRef.current && readyRef.current ? Math.floor(playerRef.current.getCurrentTime()) : 0;
    // After finishing, restart from the top next time.
    const stored = completed ? 0 : position;
    positions.current.set(lessonId, stored);
    void fetch("/api/student/courses/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, position: stored, completed }),
      keepalive,
    }).catch(() => {});
  }, []);

  const selectLesson = useCallback((id: number) => {
    const lesson = lessonsRef.current.find((l) => l.id === id);
    if (!lesson) return;
    if (id !== currentIdRef.current) save(currentIdRef.current);
    currentIdRef.current = id;
    setCurrentId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("lesson", String(lesson.position));
    window.history.replaceState(null, "", url);
    if (playerRef.current && readyRef.current) {
      playerRef.current.loadVideoById({
        videoId: lesson.youtube_video_id,
        startSeconds: positions.current.get(id) ?? 0,
      });
    }
  }, [save]);

  // Create the player once.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    const startLesson = lessonsRef.current.find((l) => l.id === currentIdRef.current)!;

    void loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return;
      const mount = document.createElement("div");
      hostRef.current.appendChild(mount);
      playerRef.current = new YT.Player(mount, {
        videoId: startLesson.youtube_video_id,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: positions.current.get(startLesson.id) ?? 0,
        },
        events: {
          onReady: () => {
            readyRef.current = true;
          },
          onStateChange: (e) => {
            const id = currentIdRef.current;
            if (e.data === STATE_PLAYING) {
              if (!timer) timer = setInterval(() => save(id), 10000);
              return;
            }
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
            if (e.data === STATE_PAUSED) save(id);
            if (e.data === STATE_ENDED) {
              save(id, true);
              setDone((prev) => new Set(prev).add(id));
              const list = lessonsRef.current;
              const next = list[list.findIndex((l) => l.id === id) + 1];
              if (next) selectLesson(next.id);
            }
          },
        },
      });
    });

    const onHide = () => {
      if (document.visibilityState === "hidden" && readyRef.current) save(currentIdRef.current, false, true);
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      if (readyRef.current) save(currentIdRef.current, false, true);
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
    };
  }, [save, selectLesson]);

  const doneCount = lessons.filter((l) => done.has(l.id)).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="relative aspect-video w-full overflow-hidden rounded-[3px] border border-border bg-black [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full">
          <div ref={hostRef} className="absolute inset-0 [&>div]:h-full [&>div]:w-full" />
        </div>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
              Lesson {currentIndex + 1} of {lessons.length}
            </div>
            <h2 className="mt-1.5 font-display text-[20px] leading-tight text-ink">{current.title}</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => selectLesson(lessons[currentIndex - 1].id)}
              className="h-10 rounded-full border border-border-strong px-5 text-[13px] font-bold text-text transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={currentIndex === lessons.length - 1}
              onClick={() => selectLesson(lessons[currentIndex + 1].id)}
              className="h-10 rounded-full border border-border-strong px-5 text-[13px] font-bold text-text transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>

        {notes[current.id] && (
          <section className="mt-8 rounded-[3px] border border-border bg-surface px-6 py-6 sm:px-8">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-[15px] text-ink uppercase">Lecture notes</h3>
              <span className="font-mono text-[10.5px] text-muted">Prepared from this lesson’s video</span>
            </div>
            <LectureNotes markdown={notes[current.id]} />
          </section>
        )}
      </div>

      <aside className="overflow-hidden rounded-[3px] border border-border bg-surface lg:max-h-[calc(100vh-180px)] lg:self-start lg:overflow-y-auto thin-scroll">
        <div className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-3.5">
          <div className="font-display text-[13px] text-ink uppercase">Lessons</div>
          <div className="mt-1 font-mono text-[10.5px] text-muted">
            {doneCount} of {lessons.length} completed
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-primary-2 transition-[width] duration-300"
              style={{ width: `${(doneCount / lessons.length) * 100}%` }}
            />
          </div>
        </div>
        <ol>
          {lessons.map((lesson, i) => {
            const active = lesson.id === current.id;
            const finished = done.has(lesson.id);
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => selectLesson(lesson.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-bg ${
                    active ? "bg-bg" : ""
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10.5px] ${
                      finished
                        ? "border-green bg-green text-white"
                        : active
                          ? "border-ink text-ink"
                          : "border-border-strong text-muted"
                    }`}
                  >
                    {finished ? "✓" : i + 1}
                  </span>
                  <span className={`text-[13px] leading-[1.4] ${active ? "font-bold text-ink" : "text-text"}`}>
                    {lesson.title}
                  </span>
                  {notes[lesson.id] && (
                    <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.08em] text-primary uppercase">
                      Notes
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
