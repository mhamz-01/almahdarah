import type { AccentToken, TaskRow } from "@/lib/types";

const SUBJECT_COLOR: Record<AccentToken, string> = {
  primary: "var(--primary)",
  "primary-2": "var(--primary-2)",
  navy: "var(--navy)",
  gold: "#8a6b12",
  green: "var(--green)",
};

const ACCENT_CYCLE: AccentToken[] = ["primary", "green", "navy", "gold", "primary-2"];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Subjects are free text, so accent colours are assigned deterministically
// from the subject string itself — same approach as quote topics.
export function accentForSubject(subject: string): AccentToken {
  return ACCENT_CYCLE[hashString(subject) % ACCENT_CYCLE.length];
}

export function colorForSubject(subject: string) {
  return SUBJECT_COLOR[accentForSubject(subject)];
}

export interface TaskDueMeta {
  label: string;
  badgeClass: string;
}

export function dueMetaFor(dueDate: string | null, now: Date): TaskDueMeta | null {
  if (!dueDate) return null;
  const due = new Date(`${dueDate}T23:59:59`);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  const dateLabel = due.toLocaleDateString("en-US", { day: "numeric", month: "short" });

  if (diffDays < 0) return { label: `Overdue · ${dateLabel}`, badgeClass: "bg-red-600/14 text-red-600" };
  if (diffDays === 0) return { label: "Due today", badgeClass: "bg-gold/30 text-[#8a6b12]" };
  if (diffDays === 1) return { label: "Due tomorrow", badgeClass: "bg-gold/30 text-[#8a6b12]" };
  if (diffDays <= 6) return { label: `Due ${dateLabel}`, badgeClass: "bg-primary/12 text-primary" };
  return { label: `Due ${dateLabel}`, badgeClass: "bg-surface-2 text-muted" };
}

export interface TaskSubjectGroup {
  subject: string;
  tasks: TaskRow[];
}

export function groupTasksBySubject(tasks: TaskRow[]): TaskSubjectGroup[] {
  const bySubject = new Map<string, TaskRow[]>();
  for (const task of tasks) {
    const list = bySubject.get(task.subject) ?? [];
    list.push(task);
    bySubject.set(task.subject, list);
  }
  return Array.from(bySubject.entries())
    .map(([subject, list]) => ({
      subject,
      tasks: [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));
}
