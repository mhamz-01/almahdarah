"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { OptionSelect } from "@/components/student/option-select";
import { colorForSubject, dueMetaFor } from "@/lib/tasks";
import { planOptions, planState } from "@/lib/task-plan";
import type { StudentTaskRow } from "@/lib/types";

export const TASK_NOTES_MAX_LENGTH = 2000;

interface TaskDrawerProps {
  /** The task to show; null keeps the drawer closed. */
  task: StudentTaskRow | null;
  todayIso: string;
  now: Date;
  busy: boolean;
  onClose: () => void;
  onToggle: (task: StudentTaskRow) => void;
  onPlan: (task: StudentTaskRow, iso: string | null) => void;
  onEdit: (task: StudentTaskRow) => void;
  onDelete: (task: StudentTaskRow) => void;
  /** Saves the student's notes; rejects with an Error whose message is shown under the field. */
  onSaveNotes: (task: StudentTaskRow, notes: string) => Promise<void>;
}

function longDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function shortYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function Icon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const PENCIL = "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z";
const TRASH = "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3";
const CLIP = "m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15 7";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h3 className="mb-2 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 py-2">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="flex min-w-0 flex-wrap items-center justify-end gap-2 text-right text-ink">{children}</dd>
    </div>
  );
}

/** Right-hand details sheet (shadcn Sheet) for one personal task, shared by the table and the weekly plan. */
export function TaskDrawer({ task, onClose, ...rest }: TaskDrawerProps) {
  return (
    <Sheet open={task !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:w-[88%] sm:max-w-[480px]">
        {task && <DrawerBody key={task.id} task={task} onClose={onClose} {...rest} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  task,
  todayIso,
  now,
  busy,
  onClose,
  onToggle,
  onPlan,
  onEdit,
  onDelete,
  onSaveNotes,
}: Omit<TaskDrawerProps, "task"> & { task: StudentTaskRow }) {
  const due = task.completed ? null : dueMetaFor(task.due_date, now);
  const state = planState(task, todayIso);
  const status =
    state === "done"
      ? { label: "Done", variant: "success" as const }
      : state === "missed"
        ? { label: "Missed", variant: "warning" as const }
        : { label: "To do", variant: "neutral" as const };

  return (
    <>
      <SheetHeader>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="flex min-w-0 items-center gap-2 text-[12px] font-bold text-muted">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: task.subject ? colorForSubject(task.subject) : "var(--muted)" }} />
            <span className="truncate">{task.subject ?? "No subject"}</span>
          </span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <SheetTitle>{task.title}</SheetTitle>
        <SheetDescription>Added {shortYear(task.created_at)}</SheetDescription>
      </SheetHeader>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <Section title="Details">
          <dl className="divide-y divide-border rounded-[16px] border border-border bg-bg px-4 text-[13.5px]">
            <DetailRow label="Plan for">
              <OptionSelect
                ariaLabel="Plan for"
                value={task.planned_date ?? ""}
                emptyLabel="Not planned"
                options={planOptions(todayIso, task.planned_date)}
                disabled={busy}
                onChange={(v) => onPlan(task, v || null)}
                className="w-[190px] max-w-full border-border-strong text-ink"
              />
            </DetailRow>
            <DetailRow label="Due">
              {due && <Badge className={due.badgeClass}>{due.label}</Badge>}
              <span>{task.due_date ? longDate(task.due_date) : "No due date"}</span>
            </DetailRow>
            {task.completed && task.completed_at && <DetailRow label="Finished">{shortYear(task.completed_at)}</DetailRow>}
          </dl>
        </Section>

        {task.description && (
          <Section title="Description">
            <p className="text-[14.5px] leading-[1.7] break-words whitespace-pre-wrap text-text">{task.description}</p>
          </Section>
        )}

        {task.attachments.length > 0 && (
          <Section title={`Files · ${task.attachments.length}`}>
            <ul className="flex flex-col gap-2">
              {task.attachments.map((a) => (
                <li key={a.url}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 items-center gap-2.5 rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:border-primary"
                  >
                    <Icon d={CLIP} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{a.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <NotesField task={task} onSave={(notes) => onSaveNotes(task, notes)} />
      </div>

      <SheetFooter>
        <Button
          variant={task.completed ? "outline" : "primary"}
          onClick={() => onToggle(task)}
          disabled={busy}
          className={`h-11 min-w-0 flex-1 disabled:opacity-60 ${task.completed ? "" : "bg-green shadow-none"}`}
        >
          {busy ? "Saving…" : task.completed ? "Move back to to do" : "Mark as done"}
        </Button>
        <Button
          variant="outline"
          aria-label="Edit task"
          title="Edit"
          onClick={() => {
            onClose();
            onEdit(task);
          }}
          className="h-11 w-11 shrink-0 px-0"
        >
          <Icon d={PENCIL} />
        </Button>
        <Button
          variant="outline"
          aria-label="Delete task"
          title="Delete"
          onClick={() => {
            onClose();
            onDelete(task);
          }}
          className="h-11 w-11 shrink-0 px-0 text-red-600 hover:border-red-600 hover:bg-red-600/10"
        >
          <Icon d={TRASH} />
        </Button>
      </SheetFooter>
    </>
  );
}

function NotesField({ task, onSave }: { task: StudentTaskRow; onSave: (notes: string) => Promise<void> }) {
  const [draft, setDraft] = useState(task.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const dirty = draft.trim() !== (task.notes ?? "").trim();

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(draft.trim());
      setDraft((d) => d.trim());
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your notes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="My notes">
      <Textarea
        id={`task-notes-${task.id}`}
        aria-label="My notes"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setJustSaved(false);
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            void save();
          }
        }}
        maxLength={TASK_NOTES_MAX_LENGTH}
        rows={4}
        placeholder="Progress, reminders, what to revise next…"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-muted">
          {draft.length}/{TASK_NOTES_MAX_LENGTH}
        </span>
        <div className="flex items-center gap-3">
          {justSaved && <span className="text-[12.5px] font-semibold text-green">Saved</span>}
          <Button size="sm" onClick={() => void save()} disabled={!dirty || saving} className="h-9 px-5 shadow-none disabled:cursor-not-allowed disabled:opacity-40">
            {saving ? "Saving…" : "Save note"}
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[12.5px] text-red-600">
          {error}
        </p>
      )}
    </Section>
  );
}
