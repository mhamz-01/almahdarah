"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type WeekClass = {
  key: string;
  iso: string;
  day: string;
  date: string;
  subject: string;
  time: string;
  teacher: string;
  status: "cancelled" | "present" | "missed" | "today" | "upcoming";
  isToday: boolean;
};

export type WeekGroup = { label: string; classes: WeekClass[] };

const BADGE: Record<WeekClass["status"], { label: string; cls: string }> = {
  cancelled: { label: "Cancelled", cls: "bg-gold/30 text-[#8a6b12]" },
  today: { label: "Today", cls: "bg-gold/34 text-[#8a6b12]" },
  present: { label: "Present", cls: "bg-green/16 text-green" },
  missed: { label: "Absent", cls: "bg-red-600/14 text-red-600" },
  upcoming: { label: "Upcoming", cls: "bg-surface-2 text-muted" },
};

export function WeekClasses({ weeks }: { weeks: WeekGroup[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0); // 0 = this week, higher = further back
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const week = weeks[index];
  if (!week) return null;

  async function send(method: "POST" | "DELETE", iso: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/student/attendance", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: iso }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong");
      setOpenKey(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-11">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="m-0 font-display text-[16px] tracking-[0.02em] text-ink uppercase">{week.label}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIndex((i) => Math.min(i + 1, weeks.length - 1));
              setOpenKey(null);
              setError(null);
            }}
            disabled={index >= weeks.length - 1}
            className="h-8 rounded-full border border-border-strong px-3.5 text-[12px] font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => {
              setIndex((i) => Math.max(i - 1, 0));
              setOpenKey(null);
              setError(null);
            }}
            disabled={index === 0}
            className="h-8 rounded-full border border-border-strong px-3.5 text-[12px] font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
      {index > 0 && (
        <p className="mb-3 text-[12.5px] text-muted">
          Tap a past class to mark yourself present. Classes you don&apos;t mark are counted as absent.
        </p>
      )}
      <div className="overflow-hidden rounded-[3px] border border-border">
        {week.classes.map((d) => {
          const editable = d.status !== "cancelled" && d.status !== "upcoming" && !d.isToday;
          const open = openKey === d.key;
          const badge = BADGE[d.status];
          const Row = editable ? "button" : "div";
          return (
            <div key={d.key} className={`border-b border-border last:border-b-0 ${d.isToday ? "bg-surface" : "bg-bg"}`}>
              <Row
                {...(editable
                  ? { type: "button" as const, onClick: () => setOpenKey(open ? null : d.key) }
                  : {})}
                className={`grid w-full grid-cols-[112px_1fr_auto] items-center gap-4 px-5 py-[18px] text-left ${
                  editable ? "cursor-pointer hover:bg-surface" : ""
                }`}
              >
                <div className="flex flex-col leading-[1.3]">
                  <span className="text-[13.5px] font-bold text-ink">{d.day}</span>
                  <span className="font-mono text-[11px] text-muted">{d.date}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[14.5px] font-semibold text-ink">{d.subject}</div>
                  <div className="mt-[3px] font-mono text-[11px] text-muted">
                    {d.time} · {d.teacher}
                  </div>
                </div>
                <span
                  className={`w-fit justify-self-end rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.08em] uppercase ${badge.cls}`}
                >
                  {badge.label}
                </span>
              </Row>
              {open && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3.5">
                  <span className="text-[13px] text-text">
                    {d.status === "present" ? "You're marked present for this class." : "You're counted absent for this class."}
                  </span>
                  {d.status === "present" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => send("DELETE", d.iso)}
                      className="h-9 rounded-full border border-border-strong px-4 text-[12.5px] font-bold text-ink disabled:opacity-60"
                    >
                      {busy ? "Saving…" : "Undo — mark absent"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => send("POST", d.iso)}
                      className="h-9 rounded-full bg-primary px-4 text-[12.5px] font-bold text-white disabled:opacity-60"
                    >
                      {busy ? "Saving…" : "Mark me present"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
