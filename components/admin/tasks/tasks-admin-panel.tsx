"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AddTaskModal } from "@/components/admin/tasks/add-task-modal";
import { colorForSubject, dueMetaFor } from "@/lib/tasks";
import type { TaskRow } from "@/lib/types";

interface TasksAdminPanelProps {
  tasks: TaskRow[];
  loadError: string | null;
  subjectSuggestions: string[];
}

const PAGE_SIZE = 8;

const inputClasses =
  "h-10 rounded-lg border-[1.5px] border-border-strong bg-bg px-3 text-[13.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

type Draft = { subject: string; title: string; description: string; due_date: string };

function draftFrom(task: TaskRow): Draft {
  return { subject: task.subject, title: task.title, description: task.description, due_date: task.due_date ?? "" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function TasksAdminPanel({ tasks: initialTasks, loadError, subjectSuggestions }: TasksAdminPanelProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string | "all">("all");
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = tasks.find((t) => t.id === selectedId) ?? null;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TaskRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const subjects = useMemo(
    () => Array.from(new Set([...subjectSuggestions, ...tasks.map((t) => t.subject)])).sort((a, b) => a.localeCompare(b)),
    [subjectSuggestions, tasks],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (subjectFilter !== "all" && t.subject !== subjectFilter) return false;
        if (!query) return true;
        return t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tasks, search, subjectFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  function selectSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function selectSubjectFilter(value: string | "all") {
    setSubjectFilter(value);
    setPage(1);
  }

  function selectTask(task: TaskRow) {
    setSelectedId(task.id);
    setDraft(draftFrom(task));
    setNewFile(null);
    setRemoveAttachment(false);
    setJustSaved(false);
    setError(null);
  }

  function updateDraft(patch: Partial<Draft>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setJustSaved(false);
  }

  async function saveChanges() {
    if (!selected || !draft) return;
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("subject", draft.subject.trim());
      form.set("title", draft.title.trim());
      form.set("description", draft.description.trim());
      form.set("due_date", draft.due_date);
      if (newFile) form.set("file", newFile);
      if (removeAttachment && !newFile) form.set("remove_attachment", "1");

      const res = await fetch(`/api/admin/tasks/${selected.id}`, { method: "PATCH", body: form });
      const json = (await res.json()) as { ok: boolean; task?: TaskRow; error?: string };
      if (!res.ok || !json.ok || !json.task) throw new Error(json.error ?? "Request failed");
      const saved = json.task;
      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      setDraft(draftFrom(saved));
      setNewFile(null);
      setRemoveAttachment(false);
      setJustSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save this task");
    } finally {
      setSaving(false);
    }
  }

  function handleCreated(task: TaskRow) {
    setTasks((prev) => [task, ...prev]);
    setSearch("");
    setSubjectFilter("all");
    setPage(1);
    selectTask(task);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/tasks/${target.id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      setTasks((prev) => prev.filter((t) => t.id !== target.id));
      setDeleteTarget(null);
      if (selectedId === target.id) {
        setSelectedId(null);
        setDraft(null);
      }
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Couldn't remove this task");
    } finally {
      setDeleting(false);
    }
  }

  const deleteDialog = (
    <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
      <DialogContent>
        {deleteTarget && (
          <div>
            <DialogTitle>Remove &ldquo;{deleteTarget.title}&rdquo;?</DialogTitle>
            <DialogDescription>
              This task will no longer show on the student portal. This can&apos;t be undone.
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
                {deleting ? "Removing…" : "Remove task"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const now = new Date();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">Tasks</h1>
          <p className="mt-1 text-[14px] text-muted">
            {tasks.length} total across {subjects.length} subject{subjects.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex h-11 items-center rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition-colors hover:brightness-[1.07]"
        >
          + Add task
        </button>
      </div>

      {loadError && (
        <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          Couldn&apos;t load tasks: {loadError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => selectSearch(e.target.value)}
          type="text"
          placeholder="Search by title or instructions…"
          className="h-11 w-full max-w-[320px] rounded-xl border-[1.5px] border-border-strong bg-surface px-4 text-[14px] text-ink outline-none focus:border-primary"
        />
      </div>

      <div className="no-scrollbar mt-3 flex flex-wrap gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => selectSubjectFilter("all")}
          className={`flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[12.5px] font-bold transition-colors ${
            subjectFilter === "all"
              ? "border-ink bg-ink text-bg"
              : "border-border-strong bg-surface text-muted hover:border-primary"
          }`}
        >
          All subjects
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => selectSubjectFilter(s)}
            className="flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[12.5px] font-bold transition-colors"
            style={
              subjectFilter === s
                ? { borderColor: colorForSubject(s), background: colorForSubject(s), color: "#fff" }
                : { borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--muted)" }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length > 0 && (
        <p className="mt-4 text-[12.5px] text-muted">
          Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
          {filtered.length} · newest first
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="flex flex-col gap-3">
          {paged.map((task) => {
            const active = task.id === selectedId;
            const dueMeta = dueMetaFor(task.due_date, now);
            return (
              <div
                key={task.id}
                onClick={() => selectTask(task)}
                className={`cursor-pointer rounded-[16px] border p-4 transition-colors ${
                  active ? "border-primary bg-primary/6" : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                        style={{ color: colorForSubject(task.subject), background: "var(--surface-2)" }}
                      >
                        {task.subject}
                      </span>
                      {dueMeta && (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${dueMeta.badgeClass}`}>
                          {dueMeta.label}
                        </span>
                      )}
                      {task.attachment_url && <span className="text-[12px] text-muted">📎</span>}
                    </div>
                    <div className="mt-1.5 truncate text-[14.5px] font-bold text-ink">{task.title}</div>
                    <p className="mt-1 line-clamp-1 text-[12.5px] text-muted">
                      {task.description || "No instructions added"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(task);
                    }}
                    className="shrink-0 rounded-full border-[1.5px] border-red-600/30 bg-red-600/10 px-3 py-1 text-[11.5px] font-bold text-red-600 transition-colors hover:border-red-600/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="rounded-[16px] border border-border bg-surface px-4 py-10 text-center text-muted">
              {tasks.length === 0 ? "No tasks yet — add the first one for a subject." : "No tasks match yet."}
            </p>
          )}

          {totalPages > 1 && (
            <nav aria-label="Tasks pagination" className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-sm font-bold text-text transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-35"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 font-mono text-[12.5px] font-bold transition-colors ${
                    n === currentPage ? "bg-primary text-white" : "text-muted hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-sm font-bold text-text transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-35"
              >
                →
              </button>
            </nav>
          )}
        </div>

        <div className="lg:sticky lg:top-[90px]">
          {!selected || !draft ? (
            <div className="rounded-[16px] border border-dashed border-border-strong bg-surface p-6 text-center text-[13.5px] text-muted">
              Select a task to edit it here, or add a new one.
            </div>
          ) : (
            <div className="rounded-[16px] border border-border bg-surface p-5">
              <div className="text-[12px] font-bold tracking-[0.08em] text-muted uppercase">
                Editing · added {formatDate(selected.created_at)}
              </div>

              <label className="mt-3 flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-ink">Subject</span>
                <input
                  value={draft.subject}
                  onChange={(e) => updateDraft({ subject: e.target.value })}
                  type="text"
                  list="task-edit-subject-suggestions"
                  className={inputClasses}
                />
                <datalist id="task-edit-subject-suggestions">
                  {subjects.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </label>

              <label className="mt-3 flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-ink">Task title</span>
                <input value={draft.title} onChange={(e) => updateDraft({ title: e.target.value })} type="text" className={inputClasses} />
              </label>

              <label className="mt-3 flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-ink">Instructions</span>
                <textarea
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  rows={4}
                  className="resize-y rounded-lg border-[1.5px] border-border-strong bg-bg px-3 py-2 text-[13px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none"
                />
              </label>

              <label className="mt-3 flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-ink">Due date</span>
                <div className="flex gap-2">
                  <input
                    value={draft.due_date}
                    onChange={(e) => updateDraft({ due_date: e.target.value })}
                    type="date"
                    className={`${inputClasses} flex-1`}
                  />
                  {draft.due_date && (
                    <button
                      type="button"
                      onClick={() => updateDraft({ due_date: "" })}
                      className="shrink-0 rounded-lg border-[1.5px] border-border-strong px-3 text-[12px] font-bold text-muted hover:border-primary hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </label>

              <div className="mt-3 flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-ink">Attachment</span>
                {selected.attachment_url && !removeAttachment && !newFile && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-bg px-3 py-2">
                    <a
                      href={selected.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-[12.5px] font-bold text-primary hover:underline"
                    >
                      📎 {selected.attachment_name ?? "View attachment"}
                    </a>
                    <button
                      type="button"
                      onClick={() => setRemoveAttachment(true)}
                      className="shrink-0 text-[11.5px] font-bold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {removeAttachment && (
                  <p className="text-[11.5px] text-muted">Attachment will be removed when you save.</p>
                )}
                <input
                  onChange={(e) => {
                    setNewFile(e.target.files?.[0] ?? null);
                    setRemoveAttachment(false);
                  }}
                  type="file"
                  className="rounded-lg border-[1.5px] border-dashed border-border-strong bg-bg px-3 py-2 text-[12px] text-text file:mr-2.5 file:rounded-full file:border-0 file:bg-primary/10 file:px-2.5 file:py-1 file:text-[11.5px] file:font-bold file:text-primary"
                />
                <span className="text-[11px] text-muted">
                  {selected.attachment_url ? "Choose a file to replace the current attachment." : "Up to 15MB."}
                </span>
              </div>

              {error && <p className="mt-2 text-[12.5px] font-semibold text-red-600">{error}</p>}

              <button
                type="button"
                onClick={saveChanges}
                disabled={saving || !draft.subject.trim() || !draft.title.trim()}
                className="mt-4 h-[42px] w-full rounded-lg bg-green text-[13.5px] font-bold text-white transition-colors hover:brightness-[1.05] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : justSaved ? "✓ Saved" : "Save changes"}
              </button>

              <button
                type="button"
                onClick={() => setDeleteTarget(selected)}
                className="mt-2.5 h-10 w-full rounded-lg border-[1.5px] border-red-600/30 bg-red-600/10 text-[13px] font-bold text-red-600 transition-colors hover:border-red-600/50"
              >
                Remove this task
              </button>
            </div>
          )}
        </div>
      </div>

      <AddTaskModal open={addOpen} onOpenChange={setAddOpen} subjectSuggestions={subjects} onCreated={handleCreated} />
      {deleteDialog}
    </div>
  );
}
