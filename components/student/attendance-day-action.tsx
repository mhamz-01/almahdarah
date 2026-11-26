"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/**
 * One day in the weekly record. When it can be changed, the whole tile is a button:
 * clicking it reveals "Mark present" (a missed day) or "Undo" (a day marked present).
 */
export function AttendanceDay({
  bg,
  action,
  children,
}: {
  bg: string;
  action: { date: string; present: boolean } | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!action) return <div className={`flex-1 basis-[150px] p-[18px] ${bg}`}>{children}</div>;

  async function send() {
    if (!action) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/student/attendance", {
        method: action.present ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: action.date }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`relative flex-1 basis-[150px] ${bg} ${open ? "ring-2 ring-primary ring-inset" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={action.present ? "Change this day" : "Attended? Mark yourself present"}
        className="group block w-full cursor-pointer p-[18px] text-left transition-colors hover:bg-primary/[0.06] focus-visible:bg-primary/[0.06] focus-visible:outline-none"
      >
        {children}
        <span
          aria-hidden
          className={`absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-border-strong bg-surface text-muted transition-colors group-hover:border-primary group-hover:text-primary ${
            open ? "border-primary text-primary" : ""
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="px-[18px] pb-[18px]">
          <button
            type="button"
            onClick={send}
            disabled={busy}
            className={`h-9 w-full rounded-full text-[12.5px] font-bold transition disabled:opacity-60 ${
              action.present ? "border border-border-strong bg-surface text-ink hover:border-ink" : "bg-primary text-white hover:brightness-[1.08]"
            }`}
          >
            {busy ? "Saving…" : action.present ? "Undo, mark as missed" : "Mark present"}
          </button>
          {error && <p className="mt-1.5 text-[11.5px] text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
