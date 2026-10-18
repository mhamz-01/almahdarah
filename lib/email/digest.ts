// Pure logic behind the two student emails: it turns database rows into plain
// objects that the templates render. No I/O here, so it is fully unit-tested.

import { computeStudentStats } from "@/lib/students";
import { buildTaskItems, type TaskItem } from "@/lib/task-items";
import { addDays, pakistanDateOf } from "@/lib/email/dates";
import { weekRangeLabel } from "@/lib/task-plan";
import type {
  AttendanceRow,
  BoardCardRow,
  ClassScheduleRow,
  StudentRow,
  StudentTaskRow,
  TaskRow,
  Weekday,
} from "@/lib/types";

const WEEKDAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const MAX_LINES = 5;

export type ClassDayStatus = "present" | "absent" | "cancelled" | "upcoming" | "none";

export interface ClassDay {
  day: Weekday;
  subject: string | null;
  status: ClassDayStatus;
}

export interface TaskLine {
  title: string;
  subject: string | null;
  due: string | null;
  overdue: boolean;
}

export interface TaskGroup {
  lines: TaskLine[];
  /** Total in the group; may exceed lines.length (the email shows "+ N more"). */
  total: number;
}

export interface WeeklyDigest {
  firstName: string;
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  /** True when the week is still in progress (used for the "send me a test" preview). */
  inProgress: boolean;
  classes: { held: number; attended: number; missed: number; days: ClassDay[] };
  streak: number;
  tasks: {
    doneThisWeek: TaskGroup;
    inProgress: TaskGroup;
    todo: TaskGroup;
    overdueCount: number;
    openCount: number;
  };
}

export interface DigestInput {
  student: StudentRow;
  attendance: AttendanceRow[];
  schedule: ClassScheduleRow[];
  assignedTasks: TaskRow[];
  personalTasks: StudentTaskRow[];
  boardCards: BoardCardRow[];
  /** Monday of the week being reported. */
  weekStart: string;
  /** Today in Pakistan: decides what is overdue and whether the week is finished. */
  todayIso: string;
}

function group(items: TaskItem[], todayIso: string): TaskGroup {
  const sorted = [...items].sort((a, b) => {
    if (a.due && b.due && a.due !== b.due) return a.due.localeCompare(b.due);
    if (!!a.due !== !!b.due) return a.due ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
  return {
    total: sorted.length,
    lines: sorted.slice(0, MAX_LINES).map((t) => ({
      title: t.title,
      subject: t.subject,
      due: t.due,
      overdue: !t.done && t.due !== null && t.due < todayIso,
    })),
  };
}

export function buildWeeklyDigest(input: DigestInput): WeeklyDigest {
  const { student, schedule, weekStart, todayIso } = input;
  const weekEnd = addDays(weekStart, 6);
  const inProgress = todayIso <= weekEnd;

  // Finished week: look from the Monday after it, so the streak includes that week and
  // every weekday counts as past. Current week: look from today.
  const referenceIso = inProgress ? todayIso : addDays(weekEnd, 1);
  const stats = computeStudentStats(student, input.attendance, new Date(`${referenceIso}T12:00:00Z`));
  const week = stats.weeks.find((w) => w.startDate === weekStart);

  const days: ClassDay[] = WEEKDAYS.map((day, i) => {
    const slot = schedule.find((s) => s.day === day);
    const cell = week?.cells[i];
    const iso = addDays(weekStart, i);
    let status: ClassDayStatus;
    if (!slot) status = "none";
    else if (slot.status !== "scheduled") status = "cancelled";
    else if (cell?.status === "present") status = "present";
    else if (cell?.status === "absent") status = "absent";
    else status = iso >= todayIso ? "upcoming" : "none";
    return { day, subject: slot?.subject ?? null, status };
  });

  // Tasks: one list across teacher-assigned and personal tasks.
  const items = buildTaskItems(input.assignedTasks, input.personalTasks, input.boardCards);
  const completedAt = new Map<string, string>();
  for (const t of input.personalTasks) if (t.completed && t.completed_at) completedAt.set(`p${t.id}`, t.completed_at);
  for (const c of input.boardCards) {
    if (c.status === "done" && c.assigned_task_id !== null) completedAt.set(`a${c.assigned_task_id}`, c.moved_at);
  }

  const inWeek = (iso: string) => iso >= weekStart && iso <= weekEnd;
  const doneThisWeek = items.filter((t) => {
    const at = t.done ? completedAt.get(t.key) : undefined;
    return at !== undefined && inWeek(pakistanDateOf(at));
  });
  const open = items.filter((t) => !t.done);
  const started = open.filter((t) => t.inProgress);
  const todo = open.filter((t) => !t.inProgress);

  return {
    firstName: student.name.trim().split(/\s+/)[0] || "there",
    weekStart,
    weekEnd,
    weekLabel: weekRangeLabel(weekStart),
    inProgress,
    classes: {
      held: days.filter((d) => d.status !== "none" && d.status !== "cancelled").length,
      attended: days.filter((d) => d.status === "present").length,
      missed: days.filter((d) => d.status === "absent").length,
      days,
    },
    streak: stats.streak,
    tasks: {
      doneThisWeek: group(doneThisWeek, todayIso),
      inProgress: group(started, todayIso),
      todo: group(todo, todayIso),
      overdueCount: open.filter((t) => t.due !== null && t.due < todayIso).length,
      openCount: open.length,
    },
  };
}

// ---------- personal plan reminder ----------

export interface PlanReminder {
  firstName: string;
  todayIso: string;
  today: TaskGroup;
  missed: TaskGroup;
}

/** The student's own plan for today, plus planned-but-unfinished tasks from earlier days. */
export function buildPlanReminder(student: Pick<StudentRow, "name">, personalTasks: StudentTaskRow[], todayIso: string): PlanReminder {
  const open = personalTasks.filter((t) => !t.completed && t.planned_date);
  const asItem = (t: StudentTaskRow): TaskItem => ({
    key: `p${t.id}`,
    source: "personal",
    id: t.id,
    title: t.title,
    subject: t.subject,
    description: t.description,
    due: t.due_date,
    created: t.created_at,
    attachments: [],
    done: false,
    inProgress: false,
    cardId: null,
  });
  const today = open.filter((t) => t.planned_date === todayIso).map(asItem);
  const missed = open
    .filter((t) => t.planned_date! < todayIso)
    .sort((a, b) => a.planned_date!.localeCompare(b.planned_date!))
    .map(asItem);

  // Today keeps creation order; missed keeps oldest-first (group() would re-sort by due date).
  const keep = (items: TaskItem[]): TaskGroup => ({
    total: items.length,
    lines: items.slice(0, MAX_LINES).map((t) => ({ title: t.title, subject: t.subject, due: t.due, overdue: t.due !== null && t.due < todayIso })),
  });

  return {
    firstName: student.name.trim().split(/\s+/)[0] || "there",
    todayIso,
    today: keep(today),
    missed: keep(missed),
  };
}

/** Nothing to say? Then no email is sent. */
export function reminderHasContent(r: PlanReminder): boolean {
  return r.today.total > 0 || r.missed.total > 0;
}
