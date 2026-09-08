"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AddClassModal } from "@/components/admin/schedule/add-class-modal";
import type { ClassScheduleRow, SlotStatus } from "@/lib/types";

interface ScheduleAdminPanelProps {
  schedule: ClassScheduleRow[];
  loadError: string | null;
}

const STATUS_META: Record<SlotStatus, { label: string; badgeClass: string }> = {
  scheduled: { label: "Running", badgeClass: "bg-green/15 text-green" },
  cancelled: { label: "Cancelled", badgeClass: "bg-red-600/10 text-red-600" },
  rescheduled: { label: "Moved", badgeClass: "bg-gold/25 text-[#8a6b12]" },
};

const STATUS_OPTIONS: { value: SlotStatus; label: string }[] = [
  { value: "scheduled", label: "Running as scheduled" },
  { value: "cancelled", label: "Cancelled this week" },
  { value: "rescheduled", label: "Rescheduled" },
];

const inputClasses =
  "h-10 rounded-lg border-[1.5px] border-border-strong bg-bg px-3 text-[13.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

type Draft = Pick<ClassScheduleRow, "subject" | "start_time" | "duration" | "teacher" | "status" | "note">;

function draftFrom(slot: ClassScheduleRow): Draft {
  return {
    subject: slot.subject,
    start_time: slot.start_time,
    duration: slot.duration,
    teacher: slot.teacher,
    status: slot.status,
    note: slot.note,
  };
}

function noticeFor(day: string, draft: Draft) {
  if (draft.status === "cancelled") {
    return {
      kind: "Class cancelled",
      colorClass: "text-red-600",
      title: `${day}’s ${draft.subject} is cancelled`,
      body: draft.note || "No session this week. Your streak is not affected by a cancelled class.",
    };
  }
  if (draft.status === "rescheduled") {
    return {
      kind: "Schedule change",
      colorClass: "text-[#8a6b12]",
      title: `${draft.subject} moves to ${draft.start_time}`,
      body: draft.note || `Note the new time for this week’s ${day} session.`,
    };
  }
  return {
    kind: "Class reminder",
    colorClass: "text-primary",
    title: `${draft.subject} begins at ${draft.start_time}`,
    body: draft.note || `${draft.teacher} takes this ${day} session. Punch your attendance when it opens.`,
  };
}

export function ScheduleAdminPanel({ schedule: initialSchedule, loadError }: ScheduleAdminPanelProps) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [selectedId, setSelectedId] = useState<number | null>(initialSchedule[0]?.id ?? null);
  const selected = schedule.find((s) => s.id === selectedId) ?? schedule[0] ?? null;
  const [draft, setDraft] = useState<Draft | null>(selected ? draftFrom(selected) : null);
  const [saving, setSaving] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassScheduleRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function selectSlot(slot: ClassScheduleRow) {
    setSelectedId(slot.id);
    setDraft(draftFrom(slot));
    setJustPublished(false);
    setError(null);
  }

  function updateDraft(patch: Partial<Draft>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setJustPublished(false);
  }

  async function publish() {
    if (!selected || !draft) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/schedule/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await res.json()) as { ok: boolean; slot?: ClassScheduleRow; error?: string };
      if (!res.ok || !json.ok || !json.slot) throw new Error(json.error ?? "Request failed");
      const savedSlot = json.slot;
      setSchedule((prev) => prev.map((s) => (s.id === savedSlot.id ? savedSlot : s)));
      setJustPublished(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't publish this change");
    } finally {
      setSaving(false);
    }
  }

  function handleCreated(slot: ClassScheduleRow) {
    setSchedule((prev) => [...prev, slot].sort((a, b) => a.sort_order - b.sort_order));
    selectSlot(slot);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/schedule/${target.id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      setSchedule((prev) => prev.filter((s) => s.id !== target.id));
      setDeleteTarget(null);
      if (selectedId === target.id) setSelectedId(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Couldn't remove this class");
    } finally {
      setDeleting(false);
    }
  }

  const takenDays = schedule.map((s) => s.day);

  const deleteDialog = (
    <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
      <DialogContent>
        {deleteTarget && (
          <div>
            <DialogTitle>Remove {deleteTarget.day}&apos;s class?</DialogTitle>
            <DialogDescription>
              {deleteTarget.subject} will no longer show on the student portal. This can&apos;t be undone.
            </DialogDescription>
            {deleteError && <p className="mt-3 text-[12.5px] font-semibold text-red-600">{deleteError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex h-10 items-center rounded-full border-[1.5px] border-border-strong bg-surface px-4 text-[13px] font-bold text-text transition-colors hover:border-primary disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex h-10 items-center rounded-full bg-red-600 px-4 text-[13px] font-bold text-white transition-colors hover:brightness-[1.07] disabled:opacity-60"
              >
                {deleting ? "Removing…" : "Remove class"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const runningCount = schedule.filter((s) => s.status === "scheduled").length;
  const changedCount = schedule.length - runningCount;

  if (!selected || !draft) {
    return (
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">Class schedule</h1>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex h-11 items-center rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition-colors hover:brightness-[1.07]"
          >
            + Add class
          </button>
        </div>
        {loadError ? (
          <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
            Couldn&apos;t load the schedule: {loadError}
          </p>
        ) : (
          <p className="mt-4 text-muted">No classes scheduled yet — add the first one to build the weekly timetable.</p>
        )}
        <AddClassModal open={addOpen} onOpenChange={setAddOpen} takenDays={takenDays} onCreated={handleCreated} />
      </div>
    );
  }

  const notice = noticeFor(selected.day, draft);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">Class schedule</h1>
          <p className="mt-1 text-[14px] text-muted">
            {runningCount} of {schedule.length} classes running this week
            {changedCount ? ` · ${changedCount} changed` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[12px] text-muted">
            ↗ Pushes live to the student portal
          </span>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex h-11 items-center rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition-colors hover:brightness-[1.07]"
          >
            + Add class
          </button>
        </div>
      </div>

      {loadError && (
        <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          Couldn&apos;t load the schedule: {loadError}
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="overflow-x-auto rounded-[16px] border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold tracking-[0.06em] text-muted uppercase">
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((slot) => {
                const meta = STATUS_META[slot.status];
                const active = slot.id === selected.id;
                return (
                  <tr
                    key={slot.id}
                    onClick={() => selectSlot(slot)}
                    className={`cursor-pointer border-b border-border transition-colors last:border-0 ${
                      active ? "bg-primary/8" : "hover:bg-surface-2"
                    }`}
                  >
                    <td className="px-4 py-3.5 font-bold text-ink">{slot.day}</td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-2.5">
                        <span className="h-[26px] w-[5px] shrink-0 rounded" style={{ background: slot.color }} />
                        <span
                          className={`font-semibold ${slot.status === "cancelled" ? "text-muted line-through" : "text-ink"}`}
                        >
                          {slot.subject}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12.5px] text-text">{slot.start_time}</td>
                    <td className="px-4 py-3.5 text-text">{slot.teacher}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-[90px]">
          <div className="rounded-[16px] border border-border bg-surface p-5">
            <div className="text-[12px] font-bold tracking-[0.08em] text-muted uppercase">Edit {selected.day}</div>

            <label className="mt-3 flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-ink">Class / subject</span>
              <input
                value={draft.subject}
                onChange={(e) => updateDraft({ subject: e.target.value })}
                type="text"
                className={inputClasses}
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-ink">Start time</span>
                <input
                  value={draft.start_time}
                  onChange={(e) => updateDraft({ start_time: e.target.value })}
                  type="text"
                  placeholder="5:00 PM"
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-ink">Duration</span>
                <input
                  value={draft.duration}
                  onChange={(e) => updateDraft({ duration: e.target.value })}
                  type="text"
                  placeholder="60 min"
                  className={inputClasses}
                />
              </label>
            </div>

            <label className="mt-3 flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-ink">Teacher</span>
              <input
                value={draft.teacher}
                onChange={(e) => updateDraft({ teacher: e.target.value })}
                type="text"
                className={inputClasses}
              />
            </label>

            <label className="mt-3 flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-ink">This week</span>
              <select
                value={draft.status}
                onChange={(e) => updateDraft({ status: e.target.value as SlotStatus })}
                className={inputClasses}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-ink">Note to students</span>
              <textarea
                value={draft.note}
                onChange={(e) => updateDraft({ note: e.target.value })}
                rows={3}
                placeholder="Shown in the student's notifications"
                className="resize-y rounded-lg border-[1.5px] border-border-strong bg-bg px-3 py-2 text-[13px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none"
              />
            </label>

            {error && <p className="mt-2 text-[12.5px] font-semibold text-red-600">{error}</p>}

            <button
              type="button"
              onClick={publish}
              disabled={saving}
              className="mt-4 h-[42px] w-full rounded-lg bg-green text-[13.5px] font-bold text-white transition-colors hover:brightness-[1.05] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Publishing…" : justPublished ? "✓ Published to students" : "Publish to students"}
            </button>

            <button
              type="button"
              onClick={() => setDeleteTarget(selected)}
              className="mt-2.5 h-10 w-full rounded-lg border-[1.5px] border-red-600/30 bg-red-600/10 text-[13px] font-bold text-red-600 transition-colors hover:border-red-600/50"
            >
              Remove this class
            </button>
          </div>

          <div>
            <div className="mb-2.5 text-[11.5px] font-bold tracking-[0.08em] text-muted uppercase">
              ↗ What the student sees
            </div>
            <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
              <div className="flex items-center justify-between gap-2.5 border-b border-border px-4 py-3.5">
                <span className={`text-[10.5px] font-bold tracking-[0.12em] uppercase ${notice.colorClass}`}>
                  {notice.kind}
                </span>
                <span className="font-mono text-[10.5px] text-muted">just now</span>
              </div>
              <div className="flex flex-col gap-1.5 p-4">
                <span className="text-[14px] font-bold text-ink">{notice.title}</span>
                <span className="text-[12.5px] text-text">{notice.body}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddClassModal open={addOpen} onOpenChange={setAddOpen} takenDays={takenDays} onCreated={handleCreated} />
      {deleteDialog}
    </div>
  );
}
