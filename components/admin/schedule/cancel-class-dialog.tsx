"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CANCEL_REASONS, type CancelReason, type ClassCancellationRow } from "@/lib/types";

export interface CancelTarget {
  date: string;
  subject: string;
  startTime: string | null;
  isToday: boolean;
  /** This week's streak target before cancelling (classes that count). */
  weekTarget: number;
}

interface CancelClassDialogProps {
  target: CancelTarget | null;
  onClose: () => void;
  onCancelled: (cancellation: ClassCancellationRow) => void;
}

function longDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export function CancelClassDialog({ target, onClose, onCancelled }: CancelClassDialogProps) {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent>
        {/* Keyed by date so the form starts fresh for every class. */}
        {target && (
          <CancelForm key={target.date} target={target} onClose={onClose} onCancelled={onCancelled} saving={saving} setSaving={setSaving} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CancelForm({
  target,
  onClose,
  onCancelled,
  saving,
  setSaving,
}: {
  target: CancelTarget;
  onClose: () => void;
  onCancelled: (cancellation: ClassCancellationRow) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [reason, setReason] = useState<CancelReason>("Teacher unavailable");
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/schedule/cancellations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: target.date, reason, note, notify }),
      });
      const json = (await res.json()) as { ok: boolean; cancellation?: ClassCancellationRow; error?: string };
      if (!res.ok || !json.ok || !json.cancellation) throw new Error(json.error ?? "Request failed");
      onCancelled(json.cancellation);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't cancel this class");
    } finally {
      setSaving(false);
    }
  }

  const after = Math.max(target.weekTarget - 1, 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-mono text-[11px] font-bold tracking-[0.12em] text-red-600 uppercase">
          {longDate(target.date)}
          {target.startTime ? ` · ${target.startTime}` : ""}
        </div>
        <DialogTitle>
          Cancel {target.isToday ? "today’s" : "this"} {target.subject}?
        </DialogTitle>
        <DialogDescription>Only this date is cancelled. The class runs as normal the following week.</DialogDescription>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-[12px] font-bold text-ink">Reason</legend>
        <div className="flex flex-wrap gap-2">
          {CANCEL_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={reason === r}
              onClick={() => setReason(r)}
              className={`h-10 rounded-full border-[1.5px] px-4 text-[13px] font-semibold transition-colors ${
                reason === r ? "border-primary bg-primary/10 text-primary" : "border-border-strong bg-surface text-ink hover:border-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-bold text-ink">Note to students (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={400}
          placeholder="e.g. Please revise last week’s lesson."
          className="resize-none rounded-lg border-[1.5px] border-border-strong bg-bg px-3 py-2 text-[13px] text-ink focus:border-primary focus:outline-none"
        />
      </label>

      <label className="flex min-h-10 items-center gap-2.5 text-[13px] font-semibold text-ink">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-[18px] w-[18px] accent-primary" />
        Email students about it
      </label>

      <div className="flex items-start gap-2.5 rounded-xl bg-navy px-3.5 py-3 text-white">
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
          <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
        </svg>
        <span className="text-[12.5px] leading-[1.5]">
          Streaks are protected. This week’s target goes from <strong>{target.weekTarget}</strong> to <strong>{after}</strong>{" "}
          {after === 1 ? "class" : "classes"} for every student.
        </span>
      </div>

      {error && <p className="text-[12.5px] font-semibold text-red-600">{error}</p>}

      <div className="flex justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex h-10 items-center rounded-full border-[1.5px] border-border-strong bg-surface px-4 text-[13px] font-bold text-text transition-colors hover:border-primary disabled:opacity-60"
        >
          Keep class
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={saving}
          className="flex h-10 items-center rounded-full bg-red-600 px-4 text-[13px] font-bold text-white transition-colors hover:brightness-[1.07] disabled:opacity-60"
        >
          {saving ? "Cancelling…" : "Cancel class"}
        </button>
      </div>
    </div>
  );
}
