import type { BoardCardRow, StudentTaskRow, TaskRow } from "@/lib/types";

// One shape for both teacher-assigned and personal tasks, so the student
// sees a single list instead of two parallel ones.
export interface TaskItem {
  key: string;
  source: "assigned" | "personal";
  id: number;
  title: string;
  subject: string | null;
  description: string;
  due: string | null;
  created: string;
  attachments: { name: string; url: string }[];
  done: boolean;
  inProgress: boolean;
  cardId: number | null;
}

export function buildTaskItems(assigned: TaskRow[], personal: StudentTaskRow[], cards: BoardCardRow[]): TaskItem[] {
  const cardByAssigned = new Map<number, BoardCardRow>();
  for (const c of cards) if (c.assigned_task_id !== null) cardByAssigned.set(c.assigned_task_id, c);
  const cardByPersonal = new Map<number, BoardCardRow>();
  for (const c of cards) if (c.personal_task_id !== null) cardByPersonal.set(c.personal_task_id, c);

  const fromTeachers: TaskItem[] = assigned.map((t) => {
    const card = cardByAssigned.get(t.id);
    return {
      key: `a${t.id}`,
      source: "assigned",
      id: t.id,
      title: t.title,
      subject: t.subject,
      description: t.description,
      due: t.due_date,
      created: t.created_at,
      attachments: t.attachment_url ? [{ name: t.attachment_name ?? "Attachment", url: t.attachment_url }] : [],
      done: card?.status === "done",
      inProgress: card?.status === "in_progress",
      cardId: card?.id ?? null,
    };
  });

  const mine: TaskItem[] = personal.map((t) => {
    const card = cardByPersonal.get(t.id);
    return {
      key: `p${t.id}`,
      source: "personal",
      id: t.id,
      title: t.title,
      subject: t.subject,
      description: t.description,
      due: t.due_date,
      created: t.created_at,
      attachments: t.attachments.map((a) => ({ name: a.name, url: a.url })),
      done: t.completed,
      inProgress: !t.completed && card?.status === "in_progress",
      cardId: card?.id ?? null,
    };
  });

  return [...fromTeachers, ...mine];
}

export type DueBucket = "overdue" | "today" | "week" | "later" | "none";

export const BUCKET_ORDER: DueBucket[] = ["overdue", "today", "week", "later", "none"];

export const BUCKET_LABEL: Record<DueBucket, string> = {
  overdue: "Overdue",
  today: "Due today",
  week: "Later this week",
  later: "Coming up",
  none: "No due date",
};

function localIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function dueBucket(due: string | null, now: Date): DueBucket {
  if (!due) return "none";
  const today = localIso(now);
  if (due < today) return "overdue";
  if (due === today) return "today";
  // Week runs to Sunday.
  const end = new Date(now);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
  return due <= localIso(end) ? "week" : "later";
}

export function compareItems(a: TaskItem, b: TaskItem): number {
  if (a.due && b.due && a.due !== b.due) return a.due.localeCompare(b.due);
  if (!!a.due !== !!b.due) return a.due ? -1 : 1;
  return new Date(b.created).getTime() - new Date(a.created).getTime();
}
