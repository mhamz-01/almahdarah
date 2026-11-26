"use client";

import Link from "next/link";
import { useState } from "react";
import { CancelClassDialog, type CancelTarget } from "@/components/admin/schedule/cancel-class-dialog";
import type { AdminClassDay } from "@/lib/admin/schedule-week";

interface TodayClassCardProps {
  /** Monday–Friday of this week. */
  week: AdminClassDay[];
  todayIso: string;
}

const COUNTED = new Set(["held", "today", "upcoming"]);

export function TodayClassCard({ week: initialWeek, todayIso }: TodayClassCardProps) {
  const [week, setWeek] = useState(initialWeek);
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = week.find((d) => d.date === todayIso) ?? null;
  const scheduled = week.filter((d) => d.state !== "no_class").length;
  const cancelled = week.filter((d) => d.state === "cancelled").length;
  const target = week.filter((d) => COUNTED.has(d.state)).length;
  const dateLabel = new Date(`${todayIso}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

  async function restore() {
    if (!today) return;
    setRestoring(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/schedule/cancellations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today.date }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      setWeek((prev) => prev.map((d) => (d.date === today.date ? { ...d, state: "today", cancellation: null } : d)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't restore the class");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <section aria-label="Today's class" className="mb-6 grid overflow-hidden rounded-[20px] bg-navy text-white lg:grid-cols-2">
      <div className="flex flex-col gap-3 p-5 sm:p-6">
        <div className="text-[11px] font-bold tracking-[0.12em] text-gold uppercase">Today’s class · {dateLabel}</div>
        {today && today.state !== "no_class" ? (
          <>
            <div className={`font-display text-[22px] leading-[1.15] ${today.state === "cancelled" ? "text-white/70 line-through" : ""}`}>
              {today.subject}
            </div>
            <div className="font-mono text-[12.5px] text-white/75">
              {today.startTime} · {today.teacher}
            </div>
            {today.state === "cancelled" && (
              <div className="text-[13px] text-white/85">Cancelled · {today.cancellation?.reason}. Streaks are protected.</div>
            )}
            <div className="mt-1 flex flex-wrap gap-2.5">
              {today.state === "cancelled" ? (
                <button
                  type="button"
                  onClick={restore}
                  disabled={restoring}
                  className="h-11 rounded-full bg-white px-5 text-[13px] font-bold text-navy disabled:opacity-60"
                >
                  {restoring ? "Restoring…" : "Restore today’s class"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setCancelTarget({ date: today.date, subject: today.subject ?? "class", startTime: today.startTime, isToday: true, weekTarget: target })
                  }
                  className="h-11 rounded-full bg-gold px-5 text-[13px] font-extrabold text-navy transition hover:brightness-[1.05]"
                >
                  Cancel today’s class
                </button>
              )}
              <Link
                href="/admin/schedule"
                className="inline-flex h-11 items-center rounded-full border-[1.5px] border-white/35 px-5 text-[13px] font-bold text-white transition-colors hover:border-white"
              >
                Open schedule
              </Link>
            </div>
            {error && <p className="text-[12.5px] font-semibold text-gold">{error}</p>}
          </>
        ) : (
          <>
            <div className="font-display text-[22px] leading-[1.15]">No class today</div>
            <Link href="/admin/schedule" className="w-fit text-[13px] font-bold text-gold underline-offset-4 hover:underline">
              Open schedule →
            </Link>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/15 p-5 sm:p-6 lg:border-t-0 lg:border-l">
        <div className="text-[11px] font-bold tracking-[0.12em] text-gold uppercase">This week</div>
        <ol className="grid grid-cols-5 gap-1.5">
          {week.map((d) => {
            const isToday = d.date === todayIso;
            const label =
              d.state === "no_class" ? "—" : d.state === "cancelled" ? "Cancelled" : d.state === "held" ? "Held" : isToday ? "Today" : "Upcoming";
            return (
              <li
                key={d.date}
                className={`rounded-xl px-1 py-2.5 text-center ${
                  d.state === "no_class" ? "border border-dashed border-white/30" : isToday ? "bg-gold/20 ring-[1.5px] ring-gold" : "bg-white/8"
                }`}
              >
                <div className={`font-mono text-[10.5px] ${isToday ? "text-gold" : "text-white/70"}`}>{d.day.slice(0, 3).toUpperCase()}</div>
                <div className={`mt-1.5 truncate text-[12px] font-bold ${d.state === "cancelled" ? "text-white/70 line-through" : ""}`}>{label}</div>
              </li>
            );
          })}
        </ol>
        <p className="text-[13px] text-white/85">
          {scheduled === 0 ? (
            "No classes on the timetable this week."
          ) : (
            <>
              Streak target this week: <strong className="text-white">{target} {target === 1 ? "class" : "classes"}</strong>
              {cancelled > 0 && ` (${scheduled} on the timetable, ${cancelled} cancelled)`}
            </>
          )}
        </p>
      </div>

      <CancelClassDialog
        target={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={(c) =>
          setWeek((prev) => prev.map((d) => (d.date === c.class_date ? { ...d, state: "cancelled", cancellation: { reason: c.reason, note: c.note } } : d)))
        }
      />
    </section>
  );
}
