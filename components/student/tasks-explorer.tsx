"use client";

import { useMemo, useState } from "react";
import { colorForSubject, dueMetaFor, groupTasksBySubject } from "@/lib/tasks";
import type { BoardCardRow, StudentTaskRow, TaskRow } from "@/lib/types";
import { TaskBoard } from "@/components/student/task-board";
import { PersonalTaskModal } from "@/components/student/personal-task-modal";

interface TasksExplorerProps {
  tasks: TaskRow[];
  personalTasks: StudentTaskRow[];
  boardCards: BoardCardRow[];
  loadError: string | null;
  personalLoadError: string | null;
  boardLoadError: string | null;
}

type Tab = "assigned" | "personal" | "board";

const NO_SUBJECT = "No subject";

function formatAdded(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function attachmentLabel(name: string | null) {
  if (!name) return "View attachment";
  return name.length > 28 ? `${name.slice(0, 25)}…` : name;
}

function sortPersonal(list: StudentTaskRow[]) {
  return [...list].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.due_date && b.due_date && a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date !== b.due_date) return a.due_date ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function TasksExplorer({ tasks, personalTasks: initialPersonal, boardCards: initialCards, loadError, personalLoadError, boardLoadError }: TasksExplorerProps) {
  const [tab, setTab] = useState<Tab>("assigned");
  const [subjectFilter, setSubjectFilter] = useState<string | "all">("all");
  const [personal, setPersonal] = useState(initialPersonal);
  const [cards, setCards] = useState(initialCards);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentTaskRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const now = useMemo(() => new Date(), []);

  const groups = useMemo(() => groupTasksBySubject(tasks), [tasks]);
  const visibleGroups = subjectFilter === "all" ? groups : groups.filter((g) => g.subject === subjectFilter);

  const personalSorted = useMemo(() => sortPersonal(personal), [personal]);
  const openCount = personal.filter((t) => !t.completed).length;
  const subjectSuggestions = useMemo(
    () => Array.from(new Set([...tasks.map((t) => t.subject), ...personal.map((t) => t.subject).filter(Boolean)] as string[])).sort(),
    [tasks, personal],
  );

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(task: StudentTaskRow) {
    setEditing(task);
    setModalOpen(true);
  }

  function handleSaved(task: StudentTaskRow) {
    setPersonal((list) => (list.some((t) => t.id === task.id) ? list.map((t) => (t.id === task.id ? task : t)) : [task, ...list]));
  }

  function upsertTask(task: StudentTaskRow) {
    setPersonal((list) => list.map((t) => (t.id === task.id ? task : t)));
  }

  function upsertCard(card: BoardCardRow) {
    setCards((list) => (list.some((c) => c.id === card.id) ? list.map((c) => (c.id === card.id ? card : c)) : [...list, card]));
  }

  async function toggleDone(task: StudentTaskRow) {
    setBusyId(task.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/student/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        task?: StudentTaskRow;
        card?: BoardCardRow | null;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.task) throw new Error(json.error ?? "Request failed");
      handleSaved(json.task);
      if (json.card) upsertCard(json.card);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Couldn't update this task");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(task: StudentTaskRow) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setBusyId(task.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/student/tasks/${task.id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      setPersonal((list) => list.filter((t) => t.id !== task.id));
      setCards((list) => list.filter((c) => c.personal_task_id !== task.id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Couldn't delete this task");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-[920px]">
      <span className="font-mono text-[11px] tracking-[0.26em] text-muted uppercase">
        {tab === "assigned"
          ? `${tasks.length} task${tasks.length === 1 ? "" : "s"} assigned`
          : tab === "personal"
            ? `${openCount} open · ${personal.length} total`
            : `${cards.length} on your board`}
      </span>
      <h1 className="mt-3.5 mb-2.5 font-display text-[clamp(28px,3.6vw,42px)] leading-none tracking-[-0.01em] text-ink uppercase">
        Tasks
      </h1>
      <p className="mb-6 text-[15px] leading-[1.65] text-text">
        {tab === "assigned"
          ? "Everything your teachers have set, grouped by subject — no checklists to fill in, just what's due."
          : tab === "personal"
            ? "Your own to-do list — add what you want to get done, with a subject, due date and files if you like."
            : "Your private board — pull in your own tasks or your teachers' and move them from to do to done."}
      </p>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="inline-flex rounded-full border border-border-strong bg-surface p-1">
          {(
            [
              ["assigned", "From teachers"],
              ["personal", "My tasks"],
              ["board", "Board"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`h-9 rounded-full px-4 text-[13px] font-bold transition-colors ${
                tab === key ? "bg-ink text-bg" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "personal" && (
          <button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition hover:brightness-[1.07]"
          >
            + Add task
          </button>
        )}
      </div>

      {tab === "assigned" ? (
        <>
          {loadError && (
            <p className="mb-6 rounded-[3px] border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
              Couldn&apos;t load your tasks: {loadError}
            </p>
          )}

          {groups.length > 0 && (
            <div className="no-scrollbar mb-8 flex flex-wrap gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSubjectFilter("all")}
                className={`flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[12.5px] font-bold transition-colors ${
                  subjectFilter === "all"
                    ? "border-ink bg-ink text-bg"
                    : "border-border-strong bg-surface text-muted hover:border-primary"
                }`}
              >
                All subjects
              </button>
              {groups.map((g) => (
                <button
                  key={g.subject}
                  type="button"
                  onClick={() => setSubjectFilter(g.subject)}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-bold transition-colors"
                  style={
                    subjectFilter === g.subject
                      ? { borderColor: colorForSubject(g.subject), background: colorForSubject(g.subject), color: "#fff" }
                      : { borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--muted)" }
                  }
                >
                  {g.subject}
                  <span className="opacity-75">· {g.tasks.length}</span>
                </button>
              ))}
            </div>
          )}

          {visibleGroups.length === 0 ? (
            <div className="rounded-[3px] border border-border bg-surface px-6 py-16 text-center">
              <div className="font-display text-[16px] tracking-[0.02em] text-ink uppercase">Nothing here yet</div>
              <p className="mx-auto mt-2.5 max-w-[42ch] text-[13.5px] text-muted">
                {tasks.length === 0
                  ? "Your teachers haven't set any tasks yet — check back after your next class."
                  : "No tasks for this subject yet."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {visibleGroups.map((group) => {
                const color = colorForSubject(group.subject);
                return (
                  <section key={group.subject}>
                    <div className="mb-3.5 flex items-baseline gap-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                      <h2 className="m-0 font-display text-[16px] tracking-[0.02em] text-ink uppercase">{group.subject}</h2>
                      <span className="font-mono text-[11px] text-muted">
                        {group.tasks.length} task{group.tasks.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      {group.tasks.map((task) => {
                        const dueMeta = dueMetaFor(task.due_date, now);
                        return (
                          <div
                            key={task.id}
                            className="flex flex-col rounded-[3px] border border-border bg-surface p-5"
                            style={{ borderTopColor: color, borderTopWidth: 3 }}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2.5">
                              <span className="text-[14.5px] font-bold text-ink">{task.title}</span>
                              {dueMeta && (
                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-[0.04em] uppercase ${dueMeta.badgeClass}`}
                                >
                                  {dueMeta.label}
                                </span>
                              )}
                            </div>

                            {task.description && (
                              <p className="mt-2.5 flex-1 text-[13.5px] leading-[1.6] text-text">{task.description}</p>
                            )}

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-border pt-3.5">
                              <span className="font-mono text-[11px] text-muted">Added {formatAdded(task.created_at)}</span>
                              {task.attachment_url && (
                                <a
                                  href={task.attachment_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-[12.5px] font-bold text-primary transition-colors hover:underline"
                                >
                                  📎 {attachmentLabel(task.attachment_name)}
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </>
      ) : tab === "board" ? (
        <TaskBoard
          assignedTasks={tasks}
          personalTasks={personal}
          cards={cards}
          loadError={boardLoadError}
          onCardsAdded={(added, updatedTasks) => {
            setCards((list) => [...list, ...added]);
            updatedTasks.forEach(upsertTask);
          }}
          onCardUpdated={(card, task) => {
            upsertCard(card);
            if (task) upsertTask(task);
          }}
          onCardRemoved={(id) => setCards((list) => list.filter((c) => c.id !== id))}
          onCreatePersonal={openCreate}
        />
      ) : (
        <>
          {(personalLoadError || actionError) && (
            <p className="mb-6 rounded-[3px] border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
              {actionError ?? `Couldn't load your personal tasks: ${personalLoadError}`}
            </p>
          )}

          {personalSorted.length === 0 ? (
            <div className="rounded-[3px] border border-border bg-surface px-6 py-16 text-center">
              <div className="font-display text-[16px] tracking-[0.02em] text-ink uppercase">No personal tasks yet</div>
              <p className="mx-auto mt-2.5 max-w-[42ch] text-[13.5px] text-muted">
                Add something you want to get done — revision, reading, a reminder for yourself.
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 h-10 rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition hover:brightness-[1.07]"
              >
                + Add your first task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {personalSorted.map((task) => {
                const color = task.subject ? colorForSubject(task.subject) : "var(--border-strong)";
                const dueMeta = task.completed ? null : dueMetaFor(task.due_date, now);
                return (
                  <div
                    key={task.id}
                    className={`flex flex-col rounded-[3px] border border-border bg-surface p-5 transition-opacity ${
                      task.completed ? "opacity-60" : ""
                    }`}
                    style={{ borderTopColor: color, borderTopWidth: 3 }}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleDone(task)}
                        disabled={busyId === task.id}
                        aria-label={task.completed ? "Mark as not done" : "Mark as done"}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] text-[12px] leading-none text-white transition-colors ${
                          task.completed ? "border-primary bg-primary" : "border-border-strong bg-bg hover:border-primary"
                        }`}
                      >
                        {task.completed && "✓"}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2.5">
                          <span className={`text-[14.5px] font-bold text-ink ${task.completed ? "line-through" : ""}`}>
                            {task.title}
                          </span>
                          {dueMeta && (
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-[0.04em] uppercase ${dueMeta.badgeClass}`}
                            >
                              {dueMeta.label}
                            </span>
                          )}
                        </div>
                        <span className="mt-1 block font-mono text-[11px] text-muted">{task.subject ?? NO_SUBJECT}</span>
                        {task.description && (
                          <p className="mt-2.5 text-[13.5px] leading-[1.6] break-words text-text">{task.description}</p>
                        )}
                        {task.attachments.length > 0 && (
                          <ul className="mt-3 flex flex-col gap-1">
                            {task.attachments.map((a) => (
                              <li key={a.path}>
                                <a
                                  href={a.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[12.5px] font-bold text-primary hover:underline"
                                >
                                  📎 {attachmentLabel(a.name)}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2.5 border-t border-border pt-3.5">
                      <span className="font-mono text-[11px] text-muted">Added {formatAdded(task.created_at)}</span>
                      <span className="flex gap-3 text-[12.5px] font-bold">
                        <button type="button" onClick={() => openEdit(task)} className="text-primary hover:underline">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(task)}
                          disabled={busyId === task.id}
                          className="text-red-600 hover:underline disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <PersonalTaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        task={editing}
        subjectSuggestions={subjectSuggestions}
        onSaved={handleSaved}
      />
    </div>
  );
}
