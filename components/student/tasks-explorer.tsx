"use client";

import { useMemo, useState } from "react";
import { buildTaskItems, type TaskItem } from "@/lib/task-items";
import type { BoardCardRow, StudentTaskRow, TaskRow } from "@/lib/types";
import { TaskBoard } from "@/components/student/task-board";
import { TaskListView } from "@/components/student/task-list-view";
import { PersonalTaskModal } from "@/components/student/personal-task-modal";

interface TasksExplorerProps {
  tasks: TaskRow[];
  personalTasks: StudentTaskRow[];
  boardCards: BoardCardRow[];
  loadError: string | null;
  personalLoadError: string | null;
  boardLoadError: string | null;
}

type View = "list" | "board";

async function request<T>(url: string, init: RequestInit): Promise<T & { ok: boolean; error?: string }> {
  const res = await fetch(url, init);
  const json = (await res.json()) as T & { ok: boolean; error?: string };
  if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export function TasksExplorer({ tasks, personalTasks: initialPersonal, boardCards: initialCards, loadError, personalLoadError, boardLoadError }: TasksExplorerProps) {
  const [view, setView] = useState<View>("list");
  const [personal, setPersonal] = useState(initialPersonal);
  const [cards, setCards] = useState(initialCards);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentTaskRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);

  const items = useMemo(() => buildTaskItems(tasks, personal, cards), [tasks, personal, cards]);
  const subjectSuggestions = useMemo(
    () => Array.from(new Set([...tasks.map((t) => t.subject), ...personal.map((t) => t.subject).filter(Boolean)] as string[])).sort(),
    [tasks, personal],
  );

  function openCreate() {
    setEditing(null);
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

  // One tick works for both kinds: personal tasks use their own flag, teacher
  // tasks are tracked through the board card (created on first tick).
  async function toggleItem(item: TaskItem) {
    setBusyKey(item.key);
    setActionError(null);
    try {
      if (item.source === "personal") {
        const json = await request<{ task?: StudentTaskRow; card?: BoardCardRow | null }>(`/api/student/tasks/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !item.done }),
        });
        if (json.task) handleSaved(json.task);
        if (json.card) upsertCard(json.card);
      } else if (item.cardId !== null) {
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

  function editItem(item: TaskItem) {
    const task = personal.find((t) => t.id === item.id);
    if (!task) return;
    setEditing(task);
    setModalOpen(true);
  }

  async function deleteItem(item: TaskItem) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    setBusyKey(item.key);
    setActionError(null);
    try {
      await request<object>(`/api/student/tasks/${item.id}`, { method: "DELETE" });
      setPersonal((list) => list.filter((t) => t.id !== item.id));
      setCards((list) => list.filter((c) => c.personal_task_id !== item.id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Couldn't delete this task");
    } finally {
      setBusyKey(null);
    }
  }

  const listError = actionError ?? loadError ?? personalLoadError;

  return (
    <div className="max-w-[860px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your work</span>
          <h1 className="mt-2.5 font-display text-[clamp(26px,3.4vw,38px)] leading-[1.05] tracking-[-0.01em] text-ink">Tasks</h1>
        </div>
        <div className="flex items-center gap-3">
          <div role="tablist" aria-label="Task view" className="inline-flex rounded-full border border-border-strong bg-surface p-1">
            {(
              [
                ["list", "List"],
                ["board", "Board"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={`h-8 rounded-full px-3.5 text-[12.5px] font-bold transition-colors ${
                  view === key ? "bg-ink text-bg" : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition hover:brightness-[1.07]"
          >
            + Add task
          </button>
        </div>
      </div>

      <div className="mt-6">
        {view === "list" ? (
          <TaskListView
            items={items}
            now={now}
            busyKey={busyKey}
            loadError={listError}
            onToggle={toggleItem}
            onEdit={editItem}
            onDelete={deleteItem}
            onCreate={openCreate}
          />
        ) : (
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
        )}
      </div>

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
