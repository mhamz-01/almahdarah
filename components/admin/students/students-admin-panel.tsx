"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AddStudentModal } from "@/components/admin/students/add-student-modal";
import { EditStudentModal } from "@/components/admin/students/edit-student-modal";
import { computeStudentStats } from "@/lib/students";
import type { StudentRow, StudentWithLoginStatus } from "@/lib/types";

interface StudentsAdminPanelProps {
  students: StudentWithLoginStatus[];
  loadError: string | null;
}

type Filter = "all" | "strong" | "risk";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All students" },
  { value: "strong", label: "Consistent (3+ weeks)" },
  { value: "risk", label: "Needs follow-up" },
];

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function matchesFilter(student: StudentWithLoginStatus, filter: Filter) {
  if (filter === "strong") return student.streak >= 3;
  if (filter === "risk") return student.missedTotal >= 3;
  return true;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function StudentsAdminPanel({ students: initialStudents, loadError }: StudentsAdminPanelProps) {
  const [students, setStudents] = useState(initialStudents);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(initialStudents[0]?.id ?? null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentWithLoginStatus | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudentWithLoginStatus | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = useMemo(() => students.filter((s) => matchesFilter(s, filter)), [students, filter]);
  const selected = students.find((s) => s.id === selectedId) ?? students[0] ?? null;
  const atRisk = students.filter((s) => s.missedTotal >= 3).length;

  function selectStudent(id: number) {
    setSelectedId(id);
    setNote("");
    setSent(false);
    setError(null);
    setCopied(false);
    setShowPassword(false);
  }

  async function sendNote() {
    if (!selected || !note.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/students/${selected.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: note.trim() }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      setNote("");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send this note");
    } finally {
      setSending(false);
    }
  }

  async function copyCredential() {
    if (!selected || selected.password === null) return;
    try {
      await navigator.clipboard.writeText(`Username: ${selected.username}
Password: ${selected.password}`);
      setCopied(true);
    } catch {
      // clipboard access denied — the admin can still select and copy the text manually
    }
  }

  function handleEdited(updated: { id: number; name: string; username: string; password: string | null }) {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, name: updated.name, username: updated.username, password: updated.password, hasLogin: true } : s)),
    );
  }

  function handleCreated(student: StudentRow, password: string) {
    const withStats: StudentWithLoginStatus = {
      ...computeStudentStats(student, [], new Date()),
      hasLogin: true,
      password,
      lastLoginAt: null,
    };
    setStudents((prev) => [withStats, ...prev]);
    selectStudent(student.id);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/students/${target.id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      setStudents((prev) => prev.filter((s) => s.id !== target.id));
      setDeleteTarget(null);
      if (selectedId === target.id) setSelectedId(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Couldn't remove this student");
    } finally {
      setDeleting(false);
    }
  }

  const deleteDialog = (
    <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
      <DialogContent>
        {deleteTarget && (
          <div>
            <DialogTitle>Remove {deleteTarget.name}?</DialogTitle>
            <DialogDescription>
              Their attendance history, notes, and portal login will all be removed. This can&apos;t be undone.
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
                {deleting ? "Removing…" : "Remove student"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (!selected) {
    return (
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">Students</h1>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex h-11 items-center rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition-colors hover:brightness-[1.07]"
          >
            + Add student
          </button>
        </div>
        {loadError ? (
          <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
            Couldn&apos;t load students: {loadError}
          </p>
        ) : (
          <p className="mt-4 text-muted">No students enrolled yet — add the first one to get started.</p>
        )}
        <AddStudentModal open={addOpen} onOpenChange={setAddOpen} onCreated={handleCreated} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">Students</h1>
          <p className="mt-1 text-[14px] text-muted">
            {students.length} enrolled · {atRisk} needing follow-up
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex h-11 items-center rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition-colors hover:brightness-[1.07]"
        >
          + Add student
        </button>
      </div>

      {loadError && (
        <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          Couldn&apos;t load students: {loadError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`flex h-9 items-center rounded-full border-[1.5px] px-3.5 text-[12.5px] font-bold transition-colors ${
              filter === f.value
                ? "border-primary bg-primary text-white"
                : "border-border-strong bg-surface text-muted hover:border-primary hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="overflow-x-auto rounded-[16px] border border-border bg-surface">
          <table className="w-full min-w-[560px] text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold tracking-[0.06em] text-muted uppercase">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Streak</th>
                <th className="px-4 py-3">This week</th>
                <th className="px-4 py-3">Last missed</th>
                <th className="px-4 py-3">Login</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const active = student.id === selected.id;
                const streakColor = student.streak >= 3 ? "text-green" : student.streak === 0 ? "text-red-600" : "text-text";
                const missedColor = student.missedTotal >= 3 ? "text-red-600" : "text-text";
                return (
                  <tr
                    key={student.id}
                    onClick={() => selectStudent(student.id)}
                    className={`cursor-pointer border-b border-border transition-colors last:border-0 ${
                      active ? "bg-primary/8" : "hover:bg-surface-2"
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
                          style={{ background: student.avatar_color }}
                        >
                          {initialsFor(student.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-ink">{student.name}</div>
                          <div className="font-mono text-[11px] text-muted">{student.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3.5 font-bold ${streakColor}`}>
                      {student.streak} {student.streak === 1 ? "week" : "weeks"}
                    </td>
                    <td className="px-4 py-3.5 text-text">{student.attendedThisWeek} / 5</td>
                    <td className={`px-4 py-3.5 ${missedColor}`}>{student.lastMissed}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          student.lastLoginAt ? "bg-green/15 text-green" : "bg-surface-2 text-muted"
                        }`}
                      >
                        {student.lastLoginAt ? "Active" : "No sign-in yet"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    No students match yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-[16px] border border-border bg-surface p-5 lg:sticky lg:top-[90px]">
          <div className="text-[12px] font-bold tracking-[0.08em] text-muted uppercase">Student progress</div>

          <div className="mt-3.5 flex items-center gap-3 border-b border-border pb-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
              style={{ background: selected.avatar_color }}
            >
              {initialsFor(selected.name)}
            </span>
            <div>
              <div className="text-[15px] font-bold text-ink">{selected.name}</div>
              <div className="font-mono text-[11.5px] text-muted">
                {selected.username}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-border bg-bg p-3.5">
              <div className="text-[10.5px] font-bold tracking-[0.1em] text-muted uppercase">Streak</div>
              <div className="mt-1.5 font-display text-[22px] text-ink">{selected.streak}</div>
              <div className="text-[11px] text-muted">weeks unbroken</div>
            </div>
            <div className="rounded-xl border border-border bg-bg p-3.5">
              <div className="text-[10.5px] font-bold tracking-[0.1em] text-muted uppercase">Missed</div>
              <div className={`mt-1.5 font-display text-[22px] ${selected.missedTotal >= 3 ? "text-red-600" : "text-ink"}`}>
                {selected.missedTotal}
              </div>
              <div className="text-[11px] text-muted">
                classes, {selected.weeks.length <= 1 ? "since joining" : `${selected.weeks.length - 1} week${selected.weeks.length - 1 === 1 ? "" : "s"}`}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2.5 text-[11px] font-bold tracking-[0.1em] text-muted uppercase">Week by week</div>
            <div className="flex flex-col gap-2">
              {selected.weeks.map((week) => (
                <div key={week.range} className="flex items-center justify-between gap-2.5">
                  <span className="w-[74px] shrink-0 font-mono text-[11px] text-muted">{week.range}</span>
                  <span className="flex flex-1 gap-1">
                    {week.cells.map((cell) => (
                      <span
                        key={cell.day}
                        title={`${cell.day} — ${cell.status === "present" ? "present" : cell.status === "absent" ? "missed" : "not held"}`}
                        className={`h-4 flex-1 rounded-[3px] border ${
                          cell.status === "present"
                            ? "border-green bg-green"
                            : cell.status === "absent"
                              ? "border-red-600 bg-transparent"
                              : "border-border bg-transparent"
                        }`}
                      />
                    ))}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-3.5 font-mono text-[10.5px] text-muted">
              <span>■ present</span>
              <span>□ missed</span>
              <span>· not held</span>
            </div>
          </div>

          {(selected.email || selected.phone) && (
            <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-[13px]">
              <span className="text-[12px] font-bold text-ink">Contact</span>
              {selected.email && <span className="break-all text-text">✉ {selected.email}</span>}
              {selected.phone && <span className="text-text">☎ {selected.phone}</span>}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <label className="text-[12px] font-bold text-ink">Portal login</label>
            <div className="rounded-lg border border-border bg-bg p-3.5 font-mono text-[13px] text-ink">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Username</span>
                <span className="font-bold">{selected.username}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-muted">Password</span>
                {selected.password !== null ? (
                  <span className="flex items-center gap-2">
                    <span className="font-bold">{showPassword ? selected.password : "••••••••"}</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="font-sans text-[11.5px] font-bold text-primary"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </span>
                ) : (
                  <span className="font-sans text-[11.5px] text-muted">Not viewable — set a new one</span>
                )}
              </div>
            </div>
            <p className="text-[12px] text-muted">
              {selected.lastLoginAt ? `Last signed in ${formatDate(selected.lastLoginAt)}` : "Hasn't signed in yet"}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditTarget(selected)}
                className="h-10 flex-1 rounded-lg border-[1.5px] border-border-strong bg-surface text-[13px] font-bold text-text transition-colors hover:border-primary hover:text-ink"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={copyCredential}
                disabled={selected.password === null}
                className="h-10 flex-1 rounded-lg border-[1.5px] border-border-strong bg-surface text-[13px] font-bold text-text transition-colors hover:border-primary hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "✓ Copied" : "Copy login"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <label className="text-[12px] font-bold text-ink">Send a note to this student</label>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setSent(false);
              }}
              rows={3}
              placeholder="Appears in their notifications"
              className="resize-y rounded-lg border-[1.5px] border-border-strong bg-bg px-3 py-2 text-[13px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none"
            />
            {error && <p className="text-[12.5px] font-semibold text-red-600">{error}</p>}
            <button
              type="button"
              onClick={sendNote}
              disabled={sending || !note.trim()}
              className="h-10 rounded-lg bg-primary text-[13px] font-bold text-white transition-colors hover:brightness-[1.05] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending…" : sent ? "✓ Sent to notifications" : "Send note"}
            </button>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(selected)}
              className="h-10 w-full rounded-lg border-[1.5px] border-red-600/30 bg-red-600/10 text-[13px] font-bold text-red-600 transition-colors hover:border-red-600/50"
            >
              Remove student
            </button>
          </div>
        </div>
      </div>

      <AddStudentModal open={addOpen} onOpenChange={setAddOpen} onCreated={handleCreated} />
      <EditStudentModal
        student={editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSaved={handleEdited}
      />
      {deleteDialog}
    </div>
  );
}
