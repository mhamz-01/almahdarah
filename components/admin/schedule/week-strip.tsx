"use client";

import { useMemo, useState } from "react";
import { CancelClassDialog, type CancelTarget } from "@/components/admin/schedule/cancel-class-dialog";
import type { AdminClassDay } from "@/lib/admin/schedule-week";

export interface LessonOption {
  id: number;
  title: string;
  position: number;
}

interface WeekStripProps {
  initialDays: AdminClassDay[];
  /** Mondays of the weeks in `initialDays`, oldest first. */
  mondays: string[];
  currentMonday: string;
  todayIso: string;
  /** Recent lessons per course, newest first, for changing a linked recording. */
  lessonsByCourse: Record<number, LessonOption[]>;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

function weekLabel(monday: string, current: string) {
  const diff = Math.round((Date.parse(monday) - Date.parse(current)) / (7 * 86_400_000));
  if (diff === 0) return "This week";
  if (diff === 1) return "Next week";
  if (diff === -1) return "Last week";
  return `Week of ${shortDate(monday)}`;
}

const COUNTED = new Set(["held", "today", "upcoming"]);

export function WeekStrip({ initialDays, mondays, currentMonday, todayIso, lessonsByCourse }: WeekStripProps) {
  const [days, setDays] = useState(initialDays);
  const [weekIndex, setWeekIndex] = useState(Math.max(mondays.indexOf(currentMonday), 0));
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  const [busyDate, setBusyDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const monday = mondays[weekIndex];
  const week = useMemo(() => days.slice(weekIndex * 5, weekIndex * 5 + 5), [days, weekIndex]);
  const scheduled = week.filter((d) => d.state !== "no_class").length;
  const target = week.filter((d) => COUNTED.has(d.state)).length;
  const friday = week[4]?.date ?? monday;

  function patchDay(date: string, patch: Partial<AdminClassDay>) {
    setDays((prev) => prev.map((d) => (d.date === date ? { ...d, ...patch } : d)));
  }

  async function restore(d: AdminClassDay) {
    setBusyDate(d.date);
    setError(null);
    try {
      const res = await fetch("/api/admin/schedule/cancellations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: d.date }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      patchDay(d.date, { cancellation: null, state: d.date === todayIso ? "today" : d.date < todayIso ? "held" : "upcoming" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't restore this class");
    } finally {
      setBusyDate(null);
    }
  }

  async function linkRecording(d: AdminClassDay, value: string) {
    setBusyDate(d.date);
    setError(null);
    try {
      const lessonId = value ? Number(value) : null;
      const res = await fetch("/api/admin/schedule/recordings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: d.date, lessonId }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      const options = d.courseId ? (lessonsByCourse[d.courseId] ?? []) : [];
      const lesson = options.find((l) => l.id === lessonId);
      // A lesson can belong to one class only: clear it from any other card.
      setDays((prev) =>
        prev.map((x) => {
          if (x.date === d.date) {
            return { ...x, recording: lesson ? { lessonId: lesson.id, title: lesson.title, position: lesson.position, source: "admin" } : null };
          }
          return x.recording && x.recording.lessonId === lessonId ? { ...x, recording: null } : x;
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't change the recording");
    } finally {
      setBusyDate(null);
    }
  }

  return (
    <section aria-labelledby="this-week" className="mt-5 rounded-[16px] border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Previous week"
            disabled={weekIndex === 0}
            onClick={() => setWeekIndex((i) => Math.max(i - 1, 0))}
            className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-border-strong text-ink transition-colors hover:border-primary disabled:opacity-40"
          >
            ‹
          </button>
          <div>
            <h2 id="this-week" className="text-[16px] font-bold text-ink">
              {weekLabel(monday, currentMonday)}
            </h2>
            <div className="font-mono text-[12px] text-muted">
              {shortDate(monday)} – {shortDate(friday)}
            </div>
          </div>
          <button
            type="button"
            aria-label="Next week"
            disabled={weekIndex >= mondays.length - 1}
            onClick={() => setWeekIndex((i) => Math.min(i + 1, mondays.length - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-border-strong text-ink transition-colors hover:border-primary disabled:opacity-40"
          >
            ›
          </button>
        </div>
        {scheduled > 0 && (
          <div className="flex items-center gap-2.5 rounded-full bg-navy py-1.5 pr-4 pl-1.5 text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-[13px] font-extrabold text-navy">{target}</span>
            <span className="text-[13px] font-semibold">
              {target === 0 ? "Every class cancelled · streaks paused" : `Streak target: ${target} ${target === 1 ? "class" : "classes"}`}
            </span>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-[12.5px] font-semibold text-red-600">{error}</p>}

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {week.map((d) => {
          const dow = d.day.slice(0, 3);
          const busy = busyDate === d.date;
          if (d.state === "no_class") {
            return (
              <article key={d.date} className="flex min-h-[200px] flex-col gap-2 rounded-[14px] border-[1.5px] border-dashed border-border-strong p-3.5">
                <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
                  {dow} {shortDate(d.date)}
                </span>
                <span className="text-[13px] font-semibold text-muted">No class on the timetable</span>
                <span className="text-[12px] text-muted">Doesn’t count towards streaks.</span>
              </article>
            );
          }

          const cancelled = d.state === "cancelled";
          const chip = cancelled
            ? { label: "Cancelled", cls: "bg-red-600/10 text-red-600" }
            : d.state === "held"
              ? { label: "Held", cls: "bg-green/15 text-green" }
              : d.state === "today"
                ? { label: "Running today", cls: "bg-primary/12 text-primary" }
                : { label: "Upcoming", cls: "bg-surface-2 text-text" };
          const options = d.courseId ? (lessonsByCourse[d.courseId] ?? []) : [];
          const selectOptions =
            d.recording && !options.some((o) => o.id === d.recording!.lessonId)
              ? [{ id: d.recording.lessonId, title: d.recording.title, position: d.recording.position }, ...options]
              : options;

          return (
            <article
              key={d.date}
              className={`flex min-h-[200px] flex-col gap-2.5 rounded-[14px] p-3.5 ${
                cancelled
                  ? "border border-red-600/25 bg-red-600/[0.04]"
                  : d.state === "today"
                    ? "border-[1.5px] border-primary bg-primary/[0.05]"
                    : "border border-border bg-surface"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
                  {dow} {shortDate(d.date)}
                </span>
                {d.state === "today" && <span className="text-[10.5px] font-extrabold tracking-[0.1em] text-primary uppercase">Today</span>}
              </div>
              <div className="flex items-start gap-2">
                <span className="h-9 w-1 shrink-0 rounded" style={{ background: d.color ?? "var(--primary)" }} />
                <div className="min-w-0">
                  <div className={`text-[14px] leading-[1.3] font-bold ${cancelled ? "text-muted line-through" : "text-ink"}`}>{d.subject}</div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-muted">
                    {d.startTime} · {d.teacher}
                  </div>
                </div>
              </div>
              <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${chip.cls}`}>{chip.label}</span>

              {cancelled && (
                <>
                  <p className="text-[12px] leading-[1.45] text-text">
                    {d.cancellation?.reason}
                    {d.cancellation?.note ? ` · ${d.cancellation.note}` : ""} · streaks protected
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => restore(d)}
                    className="mt-auto h-10 rounded-[10px] border-[1.5px] border-border-strong bg-surface text-[13px] font-bold text-ink transition-colors hover:border-primary disabled:opacity-60"
                  >
                    {busy ? "Restoring…" : "Restore class"}
                  </button>
                </>
              )}

              {d.state === "held" && (
                <>
                  <p className="text-[12px] text-text">
                    {d.presentCount} of {d.studentCount} present
                  </p>
                  <div className={`mt-auto flex flex-col gap-1.5 rounded-[10px] px-2.5 py-2 ${d.recording ? "bg-green/10" : "bg-gold/15"}`}>
                    <span className={`text-[12px] font-bold ${d.recording ? "text-green" : "text-[#8a6b12]"}`}>
                      {d.recording ? "✓ Recording linked" : "Waiting for recording"}
                    </span>
                    {d.recording ? (
                      <span className="text-[11.5px] text-text">{d.recording.title}</span>
                    ) : (
                      <span className="text-[11.5px] leading-[1.4] text-text">
                        {d.courseId ? "Linked automatically when it’s uploaded." : "Set a course on this class so recordings link automatically."}
                      </span>
                    )}
                    {selectOptions.length > 0 && (
                      <label className="flex flex-col gap-1">
                        <span className="sr-only">Recording for {d.subject}</span>
                        <select
                          value={d.recording ? String(d.recording.lessonId) : ""}
                          disabled={busy}
                          onChange={(e) => linkRecording(d, e.target.value)}
                          className="h-9 rounded-lg border border-border-strong bg-surface px-2 text-[12px] text-ink"
                        >
                          <option value="">{d.recording ? "No recording" : "Choose manually…"}</option>
                          {selectOptions.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.position}. {l.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                </>
              )}

              {(d.state === "today" || d.state === "upcoming") && (
                <button
                  type="button"
                  onClick={() =>
                    setCancelTarget({
                      date: d.date,
                      subject: d.subject ?? "class",
                      startTime: d.startTime,
                      isToday: d.state === "today",
                      weekTarget: target,
                    })
                  }
                  className={`mt-auto h-10 rounded-[10px] text-[13px] font-bold transition-colors ${
                    d.state === "today"
                      ? "bg-red-600 text-white hover:brightness-[1.07]"
                      : "border-[1.5px] border-red-600/35 bg-red-600/[0.06] text-red-600 hover:border-red-600/60"
                  }`}
                >
                  {d.state === "today" ? "Cancel today’s class" : "Cancel this date"}
                </button>
              )}
            </article>
          );
        })}
      </div>
      <p className="mt-3 text-[12.5px] text-muted">
        Cancelling affects only that date. Students’ streaks treat a cancelled class as if it was never scheduled.
      </p>

      <CancelClassDialog
        target={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={(c) => patchDay(c.class_date, { state: "cancelled", cancellation: { reason: c.reason, note: c.note } })}
      />
    </section>
  );
}
