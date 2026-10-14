"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { colorForSubject, dueMetaFor } from "@/lib/tasks";
import {
  BUCKET_LABEL,
  BUCKET_ORDER,
  compareItems,
  dueBucket,
  type DueBucket,
  type TaskItem,
} from "@/lib/task-items";

interface TaskListViewProps {
  items: TaskItem[];
  now: Date;
  busyKey: string | null;
  loadError: string | null;
  onToggle: (item: TaskItem) => void;
  onEdit: (item: TaskItem) => void;
  onDelete: (item: TaskItem) => void;
  onCreate: () => void;
}

type Status = "todo" | "done";
type Source = "all" | "assigned" | "personal";

const NO_SUBJECT = "No subject";
const NO_SUBJECT_COLOR = "var(--muted)";

function subjectOf(item: TaskItem) {
  return item.subject ?? NO_SUBJECT;
}

function subjectColor(subject: string) {
  return subject === NO_SUBJECT ? NO_SUBJECT_COLOR : colorForSubject(subject);
}

function Paperclip({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
    </svg>
  );
}

function Check({ checked, busy }: { checked: boolean; busy: boolean }) {
  return (
    <span
      className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 transition-colors ${
        checked ? "border-green bg-green text-white" : "border-border-strong bg-bg group-hover/check:border-green"
      } ${busy ? "opacity-50" : ""}`}
    >
      <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${checked ? "opacity-100" : "opacity-0 group-hover/check:opacity-40"}`} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

export function TaskListView({ items, now, busyKey, loadError, onToggle, onEdit, onDelete, onCreate }: TaskListViewProps) {
  const [status, setStatus] = useState<Status>("todo");
  const [source, setSource] = useState<Source>("all");
  const [subject, setSubject] = useState<string>("all");
  const [collapsed, setCollapsed] = useState<Set<DueBucket>>(new Set());
  const [openKey, setOpenKey] = useState<string | null>(null);

  const todoCount = items.filter((i) => !i.done).length;
  const doneCount = items.length - todoCount;

  const bySourceStatus = useMemo(
    () => items.filter((i) => (status === "done" ? i.done : !i.done) && (source === "all" || i.source === source)),
    [items, status, source],
  );

  const subjects = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of bySourceStatus) counts.set(subjectOf(i), (counts.get(subjectOf(i)) ?? 0) + 1);
    return Array.from(counts.entries()).sort(([a], [b]) => (a === NO_SUBJECT ? 1 : b === NO_SUBJECT ? -1 : a.localeCompare(b)));
  }, [bySourceStatus]);

  // If the chosen subject has no tasks left in this view, fall back to "all".
  const activeSubject = subject !== "all" && !subjects.some(([s]) => s === subject) ? "all" : subject;
  const visible = bySourceStatus.filter((i) => activeSubject === "all" || subjectOf(i) === activeSubject);

  const sections = useMemo(() => {
    if (status === "done") {
      const done = [...visible].sort((a, b) => compareItems(b, a));
      return done.length ? [{ bucket: "none" as DueBucket, label: "Completed", items: done }] : [];
    }
    return BUCKET_ORDER.map((bucket) => ({
      bucket,
      label: BUCKET_LABEL[bucket],
      items: visible.filter((i) => dueBucket(i.due, now) === bucket).sort(compareItems),
    })).filter((s) => s.items.length > 0);
  }, [visible, status, now]);

  const overdueCount = items.filter((i) => !i.done && dueBucket(i.due, now) === "overdue").length;
  const openItem = items.find((i) => i.key === openKey) ?? null;

  function toggleSection(bucket: DueBucket) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(bucket)) next.delete(bucket);
      else next.add(bucket);
      return next;
    });
  }

  return (
    <div>
      {loadError && (
        <p className="mb-5 rounded-[14px] border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">{loadError}</p>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Task status" className="inline-flex rounded-full bg-surface-2 p-1">
          {(
            [
              ["todo", "To do", todoCount],
              ["done", "Done", doneCount],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={status === key}
              onClick={() => setStatus(key)}
              className={`h-9 rounded-full px-4 text-[13px] font-bold transition-colors ${
                status === key ? "bg-ink text-bg" : "text-muted hover:text-ink"
              }`}
            >
              {label} <span className="opacity-70">{count}</span>
            </button>
          ))}
        </div>

        <div role="group" aria-label="Task source" className="inline-flex gap-1 text-[12.5px] font-bold">
          {(
            [
              ["all", "All"],
              ["assigned", "From teachers"],
              ["personal", "Mine"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={source === key}
              onClick={() => setSource(key)}
              className={`h-8 rounded-full px-3 transition-colors ${
                source === key ? "bg-primary/12 text-primary" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by subject">
          <button
            type="button"
            aria-pressed={activeSubject === "all"}
            onClick={() => setSubject("all")}
            className={`flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[12.5px] font-bold transition-colors ${
              activeSubject === "all" ? "border-ink bg-ink text-bg" : "border-border-strong bg-surface text-text hover:border-ink"
            }`}
          >
            All subjects
          </button>
          {subjects.map(([name, count]) => {
            const color = subjectColor(name);
            const active = activeSubject === name;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => setSubject(name)}
                className="flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-bold transition-colors"
                style={
                  active
                    ? { borderColor: color, background: color, color: "#fff" }
                    : { borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--text)" }
                }
              >
                {!active && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
                {name}
                <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {status === "todo" && todoCount > 0 && (
        <p className="mt-5 text-[13px] text-muted">
          {visible.length} to do
          {overdueCount > 0 && <span className="font-semibold text-red-600"> · {overdueCount} overdue</span>}
        </p>
      )}

      {/* List */}
      {sections.length === 0 ? (
        <div className="mt-6 rounded-[22px] border border-dashed border-border-strong px-6 py-14 text-center">
          <div className="text-[16px] font-bold text-ink">
            {items.length === 0 ? "No tasks yet" : status === "todo" ? "You're all caught up" : "Nothing completed yet"}
          </div>
          <p className="mx-auto mt-2 max-w-[40ch] text-[13.5px] text-muted">
            {items.length === 0
              ? "Tasks from your teachers will show up here. You can add your own too."
              : status === "todo"
                ? "No open tasks match these filters."
                : "Tick off a task and it will be kept here."}
          </p>
          {items.length === 0 && (
            <button
              type="button"
              onClick={onCreate}
              className="mt-5 h-10 rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition hover:brightness-[1.07]"
            >
              + Add a task
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          {sections.map((section) => {
            const isCollapsed = collapsed.has(section.bucket) && status === "todo";
            const urgent = section.bucket === "overdue";
            return (
              <section key={section.bucket}>
                <button
                  type="button"
                  onClick={() => status === "todo" && toggleSection(section.bucket)}
                  aria-expanded={!isCollapsed}
                  className="mb-2 flex w-full items-center gap-2 text-left"
                >
                  <span className={`text-[12px] font-bold tracking-[0.1em] uppercase ${urgent ? "text-red-600" : "text-muted"}`}>
                    {section.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted">{section.items.length}</span>
                  <span className="h-px flex-1 bg-border" />
                  {status === "todo" && (
                    <svg viewBox="0 0 24 24" className={`h-4 w-4 text-muted transition-transform ${isCollapsed ? "-rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  )}
                </button>

                {!isCollapsed && (
                  <ul className="overflow-hidden rounded-[18px] border border-border bg-surface">
                    {section.items.map((item) => {
                      const sub = subjectOf(item);
                      const due = item.done ? null : dueMetaFor(item.due, now);
                      return (
                        <li key={item.key} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-bg">
                          <button
                            type="button"
                            onClick={() => onToggle(item)}
                            disabled={busyKey === item.key}
                            aria-label={item.done ? `Mark "${item.title}" as to do` : `Mark "${item.title}" as done`}
                            className="group/check shrink-0"
                          >
                            <Check checked={item.done} busy={busyKey === item.key} />
                          </button>
                          <button type="button" onClick={() => setOpenKey(item.key)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                            <span className="min-w-0 flex-1">
                              <span className={`block truncate text-[14.5px] font-semibold ${item.done ? "text-muted line-through" : "text-ink"}`}>
                                {item.title}
                              </span>
                              <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: subjectColor(sub) }} />
                                <span className="truncate">{sub}</span>
                                <span aria-hidden>·</span>
                                <span className="shrink-0">{item.source === "assigned" ? "Teacher" : "Mine"}</span>
                                {item.inProgress && (
                                  <span className="shrink-0 rounded-full bg-primary/12 px-2 py-px text-[10.5px] font-bold text-primary">In progress</span>
                                )}
                                {item.attachments.length > 0 && (
                                  <span className="flex shrink-0 items-center gap-0.5">
                                    <Paperclip className="h-3 w-3" />
                                    {item.attachments.length}
                                  </span>
                                )}
                              </span>
                            </span>
                            {due && (
                              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${due.badgeClass}`}>{due.label}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      <Dialog open={openItem !== null} onOpenChange={(o) => !o && setOpenKey(null)}>
        <DialogContent className="thin-scroll top-0 right-0 left-auto h-full max-h-none w-full max-w-[460px] translate-x-0 translate-y-0 overflow-y-auto rounded-none border-y-0 border-r-0 sm:rounded-l-[22px]">
          {openItem && (
            <TaskDetail
              item={openItem}
              now={now}
              busy={busyKey === openItem.key}
              onToggle={() => onToggle(openItem)}
              onEdit={() => {
                setOpenKey(null);
                onEdit(openItem);
              }}
              onDelete={() => {
                setOpenKey(null);
                onDelete(openItem);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskDetail({
  item,
  now,
  busy,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: TaskItem;
  now: Date;
  busy: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const sub = subjectOf(item);
  const due = item.done ? null : dueMetaFor(item.due, now);
  const dueFull = item.due
    ? new Date(`${item.due}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })
    : "No due date";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 pr-10 text-[12px] font-bold text-muted">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: subjectColor(sub) }} />
        {sub}
        <span aria-hidden>·</span>
        {item.source === "assigned" ? "From your teacher" : "Your task"}
      </div>
      <DialogTitle className="mt-3 text-[22px] normal-case">{item.title}</DialogTitle>
      <DialogDescription className="sr-only">Task details</DialogDescription>

      <dl className="mt-5 grid grid-cols-[88px_1fr] gap-y-2.5 text-[13.5px]">
        <dt className="text-muted">Due</dt>
        <dd className="flex flex-wrap items-center gap-2 text-ink">
          {dueFull}
          {due && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${due.badgeClass}`}>{due.label}</span>}
        </dd>
        <dt className="text-muted">Status</dt>
        <dd className="text-ink">{item.done ? "Done" : item.inProgress ? "In progress" : "To do"}</dd>
        <dt className="text-muted">Added</dt>
        <dd className="text-ink">
          {new Date(item.created).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
        </dd>
      </dl>

      {item.description && (
        <p className="mt-6 text-[14.5px] leading-[1.7] break-words whitespace-pre-wrap text-text">{item.description}</p>
      )}

      {item.attachments.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Files</div>
          <ul className="flex flex-col gap-2">
            {item.attachments.map((a) => (
              <li key={a.url}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-[13px] font-semibold text-primary hover:border-primary"
                >
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="truncate">{a.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          className={`h-11 rounded-full px-6 text-[14px] font-bold transition disabled:opacity-60 ${
            item.done ? "border border-border-strong text-ink hover:border-ink" : "bg-green text-white hover:brightness-[1.07]"
          }`}
        >
          {busy ? "Saving…" : item.done ? "Move back to to do" : "Mark as done"}
        </button>
        {item.source === "personal" && (
          <span className="flex gap-4 text-[13px] font-bold">
            <button type="button" onClick={onEdit} className="text-primary hover:underline">
              Edit
            </button>
            <button type="button" onClick={onDelete} className="text-red-600 hover:underline">
              Delete
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
