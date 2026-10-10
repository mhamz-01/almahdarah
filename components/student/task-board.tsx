"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { colorForSubject, dueMetaFor } from "@/lib/tasks";
import type { BoardCardRow, BoardStatus, StudentTaskRow, TaskRow } from "@/lib/types";

const COLUMNS: { status: BoardStatus; label: string; dot: string }[] = [
  { status: "todo", label: "To do", dot: "var(--muted)" },
  { status: "in_progress", label: "In progress", dot: "var(--primary)" },
  { status: "done", label: "Done", dot: "var(--green)" },
];

interface TaskBoardProps {
  assignedTasks: TaskRow[];
  personalTasks: StudentTaskRow[];
  cards: BoardCardRow[];
  loadError: string | null;
  onCardsAdded: (cards: BoardCardRow[], tasks: StudentTaskRow[]) => void;
  onCardUpdated: (card: BoardCardRow, task: StudentTaskRow | null) => void;
  onCardRemoved: (cardId: number) => void;
  onCreatePersonal: () => void;
}

interface ResolvedCard {
  card: BoardCardRow;
  source: "personal" | "assigned";
  title: string;
  subject: string | null;
  description: string;
  dueDate: string | null;
  fileCount: number;
}

export function TaskBoard({
  assignedTasks,
  personalTasks,
  cards,
  loadError,
  onCardsAdded,
  onCardUpdated,
  onCardRemoved,
  onCreatePersonal,
}: TaskBoardProps) {
  const [pickerStatus, setPickerStatus] = useState<BoardStatus | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overColumn, setOverColumn] = useState<BoardStatus | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);

  const resolved = useMemo(() => {
    const personalById = new Map(personalTasks.map((t) => [t.id, t]));
    const assignedById = new Map(assignedTasks.map((t) => [t.id, t]));
    const out: ResolvedCard[] = [];
    for (const card of cards) {
      if (card.personal_task_id !== null) {
        const t = personalById.get(card.personal_task_id);
        if (t) {
          out.push({
            card,
            source: "personal",
            title: t.title,
            subject: t.subject,
            description: t.description,
            dueDate: t.due_date,
            fileCount: t.attachments.length,
          });
        }
      } else if (card.assigned_task_id !== null) {
        const t = assignedById.get(card.assigned_task_id);
        if (t) {
          out.push({
            card,
            source: "assigned",
            title: t.title,
            subject: t.subject,
            description: t.description,
            dueDate: t.due_date,
            fileCount: t.attachment_url ? 1 : 0,
          });
        }
      }
    }
    return out;
  }, [cards, personalTasks, assignedTasks]);

  async function move(cardId: number, status: BoardStatus) {
    const current = cards.find((c) => c.id === cardId);
    if (!current || current.status === status) return;
    setBusyId(cardId);
    setError(null);
    try {
      const res = await fetch(`/api/student/board/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        card?: BoardCardRow;
        task?: StudentTaskRow | null;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.card) throw new Error(json.error ?? "Request failed");
      onCardUpdated(json.card, json.task ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't move this card");
    } finally {
      setBusyId(null);
    }
  }

  async function removeCard(cardId: number) {
    setBusyId(cardId);
    setError(null);
    try {
      const res = await fetch(`/api/student/board/${cardId}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      onCardRemoved(cardId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't remove this card");
    } finally {
      setBusyId(null);
    }
  }

  const onBoardPersonal = new Set(cards.map((c) => c.personal_task_id).filter((id): id is number => id !== null));
  const onBoardAssigned = new Set(cards.map((c) => c.assigned_task_id).filter((id): id is number => id !== null));
  const availablePersonal = personalTasks.filter((t) => !onBoardPersonal.has(t.id));
  const availableAssigned = assignedTasks.filter((t) => !onBoardAssigned.has(t.id));

  return (
    <div>
      {(loadError || error) && (
        <p className="mb-6 rounded-[3px] border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          {error ?? `Couldn't load your board: ${loadError}`}
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted">
          Pick the tasks you want to track, then drag them across — or use the menu on each card.
        </p>
        <button
          type="button"
          onClick={() => setPickerStatus("todo")}
          className="h-10 rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition hover:brightness-[1.07]"
        >
          + Add to board
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const colCards = resolved
            .filter((r) => r.card.status === col.status)
            .sort((a, b) => new Date(b.card.moved_at).getTime() - new Date(a.card.moved_at).getTime());
          const isOver = overColumn === col.status && dragId !== null;

          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                setOverColumn(col.status);
              }}
              onDragLeave={() => setOverColumn((c) => (c === col.status ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                setOverColumn(null);
                if (dragId !== null) move(dragId, col.status);
                setDragId(null);
              }}
              className={`flex min-h-[220px] flex-col rounded-[6px] border bg-bg p-3 transition-colors ${
                isOver ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: col.dot }} />
                  <span className="font-display text-[13.5px] tracking-[0.04em] text-ink uppercase">{col.label}</span>
                  <span className="font-mono text-[11px] text-muted">{colCards.length}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPickerStatus(col.status)}
                  aria-label={`Add a task to ${col.label}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[18px] leading-none text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  +
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                {colCards.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-[4px] border border-dashed border-border-strong px-3 py-8 text-center text-[12.5px] text-muted">
                    Drop a card here
                  </div>
                )}

                {colCards.map((r) => {
                  const color = r.subject ? colorForSubject(r.subject) : "var(--border-strong)";
                  const dueMeta = r.card.status === "done" ? null : dueMetaFor(r.dueDate, now);
                  return (
                    <div
                      key={r.card.id}
                      draggable
                      onDragStart={() => setDragId(r.card.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverColumn(null);
                      }}
                      className={`cursor-grab rounded-[4px] border border-border bg-surface p-3.5 active:cursor-grabbing ${
                        dragId === r.card.id || busyId === r.card.id ? "opacity-50" : ""
                      }`}
                      style={{ borderTopColor: color, borderTopWidth: 3 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[13.5px] leading-[1.35] font-bold text-ink ${
                            r.card.status === "done" ? "line-through opacity-70" : ""
                          }`}
                        >
                          {r.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCard(r.card.id)}
                          disabled={busyId === r.card.id}
                          aria-label="Remove from board"
                          title="Remove from board"
                          className="shrink-0 text-[14px] leading-none text-muted transition-colors hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.04em] uppercase ${
                            r.source === "personal" ? "bg-primary/12 text-primary" : "bg-gold/30 text-[#8a6b12]"
                          }`}
                        >
                          {r.source === "personal" ? "Mine" : "Teacher"}
                        </span>
                        {r.subject && <span className="font-mono text-[10.5px] text-muted">{r.subject}</span>}
                        {dueMeta && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${dueMeta.badgeClass}`}>
                            {dueMeta.label}
                          </span>
                        )}
                        {r.fileCount > 0 && <span className="text-[11px] text-muted">📎 {r.fileCount}</span>}
                      </div>

                      {r.description && (
                        <p className="mt-2 line-clamp-2 text-[12.5px] leading-[1.5] text-text">{r.description}</p>
                      )}

                      <select
                        value={r.card.status}
                        onChange={(e) => move(r.card.id, e.target.value as BoardStatus)}
                        disabled={busyId === r.card.id}
                        aria-label="Move to column"
                        className="mt-3 h-8 w-full rounded-[6px] border border-border-strong bg-bg px-2 text-[12px] font-medium text-text focus:border-primary focus:outline-none"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.status} value={c.status}>
                            Move to: {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AddToBoardDialog
        key={pickerStatus ?? "closed"}
        open={pickerStatus !== null}
        initialStatus={pickerStatus ?? "todo"}
        personal={availablePersonal}
        assigned={availableAssigned}
        onClose={() => setPickerStatus(null)}
        onCreatePersonal={() => {
          setPickerStatus(null);
          onCreatePersonal();
        }}
        onAdded={onCardsAdded}
      />
    </div>
  );
}

interface AddToBoardDialogProps {
  open: boolean;
  initialStatus: BoardStatus;
  personal: StudentTaskRow[];
  assigned: TaskRow[];
  onClose: () => void;
  onCreatePersonal: () => void;
  onAdded: (cards: BoardCardRow[], tasks: StudentTaskRow[]) => void;
}

function AddToBoardDialog({
  open,
  initialStatus,
  personal,
  assigned,
  onClose,
  onCreatePersonal,
  onAdded,
}: AddToBoardDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<BoardStatus>(initialStatus);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function submit() {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const items = Array.from(selected).map((key) => {
        const [source, id] = key.split(":");
        return { source, taskId: Number(id) };
      });
      const res = await fetch("/api/student/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, status }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        cards?: BoardCardRow[];
        tasks?: StudentTaskRow[];
        error?: string;
      };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      onAdded(json.cards ?? [], json.tasks ?? []);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add to the board");
    } finally {
      setSubmitting(false);
    }
  }

  const nothingToAdd = personal.length === 0 && assigned.length === 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="thin-scroll max-h-[90vh] overflow-y-auto">
        <DialogTitle>Add to your board</DialogTitle>
        <DialogDescription>Choose from your own tasks or the ones your teachers set.</DialogDescription>

        <div className="mt-5 flex flex-col gap-5">
          {nothingToAdd ? (
            <p className="rounded-[8px] border border-border bg-bg px-4 py-6 text-center text-[13.5px] text-muted">
              Every task is already on your board.
            </p>
          ) : (
            <>
              <PickerSection
                title="My tasks"
                emptyText="You have no other personal tasks."
                items={personal.map((t) => ({ key: `personal:${t.id}`, title: t.title, subject: t.subject }))}
                selected={selected}
                onToggle={toggle}
              />
              <PickerSection
                title="From teachers"
                emptyText="No other teacher tasks."
                items={assigned.map((t) => ({ key: `assigned:${t.id}`, title: t.title, subject: t.subject }))}
                selected={selected}
                onToggle={toggle}
              />
            </>
          )}

          <button type="button" onClick={onCreatePersonal} className="self-start text-[13px] font-bold text-primary hover:underline">
            + Create a new personal task instead
          </button>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Add to column</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BoardStatus)}
              className="h-11 rounded-xl border-[1.5px] border-border-strong bg-surface px-3 text-[14.5px] text-ink focus:border-primary focus:outline-none"
            >
              {COLUMNS.map((c) => (
                <option key={c.status} value={c.status}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={selected.size === 0 || submitting}
            className={`flex h-12 items-center justify-center rounded-full text-[14.5px] font-bold transition-colors duration-200 ${
              selected.size > 0 && !submitting
                ? "cursor-pointer bg-primary text-white hover:brightness-[1.07]"
                : "cursor-not-allowed bg-surface-2 text-muted"
            }`}
          >
            {submitting ? "Adding…" : selected.size > 0 ? `Add ${selected.size} to board` : "Select tasks to add"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PickerSection({
  title,
  emptyText,
  items,
  selected,
  onToggle,
}: {
  title: string;
  emptyText: string;
  items: { key: string; title: string; subject: string | null }[];
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{title}</div>
      {items.length === 0 ? (
        <p className="text-[12.5px] text-muted">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li key={item.key}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-[8px] border px-3 py-2.5 transition-colors ${
                  selected.has(item.key) ? "border-primary bg-primary/5" : "border-border bg-bg hover:border-border-strong"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(item.key)}
                  onChange={() => onToggle(item.key)}
                  className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold text-ink">{item.title}</span>
                  <span className="block font-mono text-[10.5px] text-muted">{item.subject ?? "No subject"}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
