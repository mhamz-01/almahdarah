"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { buildTaskItems, type TaskItem } from "@/lib/task-items";
import { toIso } from "@/lib/task-plan";
import type { BoardCardRow, StudentTaskRow, TaskRow } from "@/lib/types";
import { TaskListView } from "@/components/student/task-list-view";
import { MyTasksTable } from "@/components/student/my-tasks-table";
import { WeeklyPlanner } from "@/components/student/weekly-planner";
import { TaskDrawer } from "@/components/student/task-drawer";
import { PersonalTaskModal } from "@/components/student/personal-task-modal";

interface TasksExplorerProps {
  tasks: TaskRow[];
  personalTasks: StudentTaskRow[];
  boardCards: BoardCardRow[];
  loadError: string | null;
  personalLoadError: string | null;
  boardLoadError: string | null;
}

type Section = "teacher" | "mine";
type MineView = "table" | "plan";

async function request<T>(url: string, init: RequestInit): Promise<T & { ok: boolean; error?: string }> {
  const res = await fetch(url, init);
  const json = (await res.json()) as T & { ok: boolean; error?: string };
  if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

// Dates depend on the viewer's own time zone, so the personal sections only
// render once the page is running in the browser (avoids a server/client mismatch).
const noopSubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function TasksExplorer({ tasks, personalTasks: initialPersonal, boardCards: initialCards, loadError, personalLoadError }: TasksExplorerProps) {
  const [section, setSection] = useState<Section | null>(null);
  const [mineView, setMineView] = useState<MineView>("table");
  const [personal, setPersonal] = useState(initialPersonal);
  const [cards, setCards] = useState(initialCards);
  const [modalOpen, setModalOpen] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [editing, setEditing] = useState<StudentTaskRow | null>(null);
  const [createPlanned, setCreatePlanned] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const isClient = useIsClient();
  const now = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toIso(now), [now]);

  const items = useMemo(() => buildTaskItems(tasks, personal, cards), [tasks, personal, cards]);
  const teacherItems = useMemo(() => items.filter((i) => i.source === "assigned"), [items]);
  const teacherOpen = teacherItems.filter((i) => !i.done).length;
  const mineOpen = personal.filter((t) => !t.completed).length;

  const subjectSuggestions = useMemo(
    () => Array.from(new Set([...tasks.map((t) => t.subject), ...personal.map((t) => t.subject).filter(Boolean)] as string[])).sort(),
    [tasks, personal],
  );

  function openCreate(plannedDate?: string) {
    setEditing(null);
    setCreatePlanned(plannedDate ?? null);
    setModalOpen(true);
  }

  const openTask = personal.find((t) => t.id === openId) ?? null;

  function openEdit(task: StudentTaskRow) {
    setEditing(task);
    setModalOpen(true);
  }

  function handleSaved(task: StudentTaskRow) {
    setPersonal((list) => (list.some((t) => t.id === task.id) ? list.map((t) => (t.id === task.id ? task : t)) : [task, ...list]));
  }

  function upsertCard(card: BoardCardRow) {
    setCards((list) => (list.some((c) => c.id === card.id) ? list.map((c) => (c.id === card.id ? card : c)) : [...list, card]));
  }

  // Teacher tasks are tracked through a board card (created on first tick).
  async function toggleTeacherItem(item: TaskItem) {
    setBusyKey(item.key);
    setActionError(null);
    try {
      if (item.cardId !== null) {
        const json = await request<{ card?: BoardCardRow }>(`/api/student/board/${item.cardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: item.done ? "todo" : "done" }),
        });
        if (json.card) upsertCard(json.card);
      } else {
        const json = await request<{ cards?: BoardCardRow[] }>("/api/student/board", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: [{ source: "assigned", taskId: item.id }], status: "done" }),
        });
        (json.cards ?? []).forEach(upsertCard);
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Couldn't update this task");
    } finally {
      setBusyKey(null);
    }
  }

  async function togglePersonal(task: StudentTaskRow) {
    setBusyId(task.id);
    setActionError(null);
    try {
      const json = await request<{ task?: StudentTaskRow; card?: BoardCardRow | null }>(`/api/student/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (json.task) handleSaved(json.task);
      if (json.card) upsertCard(json.card);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Couldn't update this task");
    } finally {
      setBusyId(null);
    }
  }

  // Moves a task to a day (or off the plan with null). Updates instantly and
  // rolls back if the server says no.
  async function planTask(task: StudentTaskRow, iso: string | null) {
    const previous = task.planned_date;
    setPersonal((list) => list.map((t) => (t.id === task.id ? { ...t, planned_date: iso } : t)));
    setBusyId(task.id);
    setActionError(null);
    try {
      const json = await request<{ task?: StudentTaskRow }>(`/api/student/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planned_date: iso }),
      });
      if (json.task) handleSaved(json.task);
    } catch (e) {
      setPersonal((list) => list.map((t) => (t.id === task.id ? { ...t, planned_date: previous } : t)));
      setActionError(e instanceof Error ? e.message : "Couldn't move this task");
    } finally {
      setBusyId(null);
    }
  }

  async function saveNotes(task: StudentTaskRow, notes: string) {
    const json = await request<{ task?: StudentTaskRow }>(`/api/student/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (json.task) handleSaved(json.task);
  }

  async function deletePersonal(task: StudentTaskRow) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setBusyId(task.id);
    setActionError(null);
    try {
      await request<object>(`/api/student/tasks/${task.id}`, { method: "DELETE" });
      setPersonal((list) => list.filter((t) => t.id !== task.id));
      setCards((list) => list.filter((c) => c.personal_task_id !== task.id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Couldn't delete this task");
    } finally {
      setBusyId(null);
    }
  }

  const sectionButtons = [
    {
      key: "teacher" as const,
      title: "Tasks from teachers",
      hint: "Work set for the whole class",
      open: teacherOpen,
      icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
    },
    {
      key: "mine" as const,
      title: "My personal tasks",
      hint: "Your own to-dos and weekly plan",
      open: mineOpen,
      icon: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
    },
  ];
  const current = sectionButtons.find((b) => b.key === section) ?? null;

  return (
    <div className="max-w-[1040px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your work</span>
          <h1 className="mt-2.5 font-display text-[clamp(26px,3.4vw,38px)] leading-[1.05] tracking-[-0.01em] text-ink">Tasks</h1>
        </div>
      </div>

      {current === null ? (
        /* Landing: nothing is listed until the student picks where to look */
        <div className="mx-auto flex min-h-[52vh] max-w-[760px] flex-col items-center justify-center py-10 text-center">
          <h2 className="text-[clamp(18px,2.4vw,24px)] font-bold text-ink">What would you like to open?</h2>
          <p className="mt-1.5 text-[14px] text-muted">Choose one to see your tasks.</p>
          <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
            {sectionButtons.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => setSection(b.key)}
                className="group flex flex-col items-center rounded-[24px] border-2 border-border bg-surface px-6 py-9 transition-colors hover:border-primary hover:bg-primary/[0.04] focus-visible:border-primary focus-visible:outline-none"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={b.icon} />
                  </svg>
                </span>
                <span className="mt-5 text-[18px] font-bold text-ink">{b.title}</span>
                <span className="mt-1 text-[13px] text-muted">{b.hint}</span>
                <span className="mt-5 rounded-full bg-surface-2 px-3.5 py-1 font-mono text-[11.5px] text-text">
                  {b.open} to do
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSection(null)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-border-strong bg-surface pr-4 pl-3 text-[13px] font-bold text-ink hover:border-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 6-6 6 6 6" />
              </svg>
              Back
            </button>
          </div>

          <div className="mt-6">
        {section === "teacher" ? (
          <div className="max-w-[860px]">
            <TaskListView
              items={teacherItems}
              now={now}
              busyKey={busyKey}
              loadError={actionError ?? loadError}
              simple
              onToggle={toggleTeacherItem}
              onEdit={() => {}}
              onDelete={() => {}}
              onCreate={() => {}}
            />
          </div>
        ) : !isClient ? (
          <div className="h-48 animate-pulse rounded-[22px] bg-surface-2" aria-hidden />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="How to view my tasks" className="inline-flex rounded-full border border-border-strong bg-surface p-1">
              {(
                [
                  ["table", "Table"],
                  ["plan", "Weekly plan"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={mineView === key}
                  onClick={() => setMineView(key)}
                  className={`h-8 rounded-full px-4 text-[12.5px] font-bold transition-colors ${
                    mineView === key ? "bg-ink text-bg" : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => openCreate()}
              className="h-9 rounded-full bg-primary px-5 text-[13px] font-bold text-white transition hover:brightness-[1.07]"
            >
              + Add task
            </button>
            </div>

            {mineView === "table" ? (
              <MyTasksTable
                tasks={personal}
                todayIso={todayIso}
                now={now}
                busyId={busyId}
                error={actionError ?? personalLoadError}
                onToggle={togglePersonal}
                onPlan={planTask}
                onOpen={(t) => setOpenId(t.id)}
                onEdit={openEdit}
                onDelete={deletePersonal}
                onCreate={() => openCreate()}
              />
            ) : (
              <WeeklyPlanner
                tasks={personal}
                todayIso={todayIso}
                busyId={busyId}
                error={actionError ?? personalLoadError}
                onToggle={togglePersonal}
                onPlan={planTask}
                onOpen={(t) => setOpenId(t.id)}
                onCreate={openCreate}
              />
            )}
          </>
        )}
      </div>
        </>
      )}

      <TaskDrawer
        task={openTask}
        todayIso={todayIso}
        now={now}
        busy={openTask !== null && busyId === openTask.id}
        onClose={() => setOpenId(null)}
        onToggle={togglePersonal}
        onPlan={planTask}
        onEdit={openEdit}
        onDelete={deletePersonal}
        onSaveNotes={saveNotes}
      />

      <PersonalTaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        task={editing}
        defaultPlannedDate={createPlanned}
        subjectSuggestions={subjectSuggestions}
        onSaved={handleSaved}
      />
    </div>
  );
}
