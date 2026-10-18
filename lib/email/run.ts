// Orchestration for the two emails: load data, decide who gets what, send, and record it.
// Used by the cron routes and by "send me a test email".

import { buildPlanReminder, buildWeeklyDigest, reminderHasContent } from "@/lib/email/digest";
import { currentWeek, isoWeekday, pakistanToday, previousWeek } from "@/lib/email/dates";
import { emailConfigured, sendMany, sendOne, siteUrl, type OutgoingEmail, type SendResult } from "@/lib/email/send";
import { renderPlanReminder, renderWeeklyDigest } from "@/lib/email/templates";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type {
  AttendanceRow,
  BoardCardRow,
  ClassScheduleRow,
  StudentEmailPrefsRow,
  StudentRow,
  StudentTaskRow,
  TaskRow,
} from "@/lib/types";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

const PAGE = 1000;
const DEFAULT_REMINDER_DAYS = [1, 2, 3, 4, 5];
export const TEST_COOLDOWN_SECONDS = 60;

/** PostgREST caps a response at 1000 rows, so page through anything that can grow. */
async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE) return rows;
  }
}

function groupBy<T extends { student_id: number }>(rows: T[]): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const r of rows) {
    const list = map.get(r.student_id);
    if (list) list.push(r);
    else map.set(r.student_id, [r]);
  }
  return map;
}

function prefsOf(student: StudentRow, map: Map<number, StudentEmailPrefsRow>): Pick<StudentEmailPrefsRow, "weekly_digest" | "plan_reminder" | "reminder_days"> {
  const p = map.get(student.id);
  return {
    weekly_digest: p?.weekly_digest ?? true,
    plan_reminder: p?.plan_reminder ?? false,
    reminder_days: p?.reminder_days ?? DEFAULT_REMINDER_DAYS,
  };
}

type EmailStudent = StudentRow & { last_login_at: string | null };

async function loadStudents(supabase: Admin, onlyStudentId?: number): Promise<EmailStudent[]> {
  let query = supabase.from("students").select("id, created_at, name, username, avatar_color, email, phone, last_login_at").not("email", "is", null);
  if (onlyStudentId !== undefined) query = query.eq("id", onlyStudentId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as EmailStudent[]).filter((s) => s.email && s.email.trim());
}

// `tolerateMissingTable` lets a dry run preview before migration 0026 has been applied (everyone gets the defaults).
// A real send never tolerates it: without the table it could not record what it sent.
async function loadPrefs(supabase: Admin, tolerateMissingTable = false): Promise<Map<number, StudentEmailPrefsRow>> {
  try {
    const rows = await fetchAll<StudentEmailPrefsRow>((from, to) => supabase.from("student_email_prefs").select("*").range(from, to));
    return new Map(rows.map((r) => [r.student_id, r]));
  } catch (e) {
    if (tolerateMissingTable && e instanceof Error && /student_email_prefs/.test(e.message)) return new Map();
    throw e;
  }
}

export interface RunSummary {
  ok: boolean;
  kind: "weekly-digest" | "plan-reminder";
  dryRun: boolean;
  /** Pakistan date the run was decided for. */
  date: string;
  eligible: number;
  sent: number;
  failed: { to: string; error: string }[];
  skipped: Record<string, number>;
  /** Dry runs only: who would be emailed, with the subject line. */
  preview?: { studentId: number; to: string; subject: string }[];
}

export interface RunOptions {
  now?: Date;
  dryRun?: boolean;
  onlyStudentId?: number;
}

function bump(skipped: Record<string, number>, reason: string) {
  skipped[reason] = (skipped[reason] ?? 0) + 1;
}

async function recordSent(supabase: Admin, studentIds: number[], column: "last_digest_sent_on" | "last_reminder_sent_on", date: string) {
  if (!studentIds.length) return;
  await supabase
    .from("student_email_prefs")
    .upsert(studentIds.map((student_id) => ({ student_id, [column]: date, updated_at: new Date().toISOString() })), { onConflict: "student_id" });
}

// ---------- weekly progress email ----------

export async function runWeeklyDigest(options: RunOptions = {}): Promise<RunSummary> {
  const now = options.now ?? new Date();
  const todayIso = pakistanToday(now);
  const week = previousWeek(todayIso);
  const supabase = createSupabaseAdminClient();
  const summary: RunSummary = { ok: true, kind: "weekly-digest", dryRun: !!options.dryRun, date: todayIso, eligible: 0, sent: 0, failed: [], skipped: {} };

  const [students, prefs] = await Promise.all([loadStudents(supabase, options.onlyStudentId), loadPrefs(supabase, !!options.dryRun)]);
  const [attendance, schedule, assigned, personal, cards] = await Promise.all([
    fetchAll<AttendanceRow>((from, to) => supabase.from("attendance").select("*").gte("class_date", week.start).range(from, to)),
    supabase.from("class_schedule").select("*").then((r) => (r.data ?? []) as ClassScheduleRow[]),
    supabase.from("tasks").select("*").then((r) => (r.data ?? []) as TaskRow[]),
    fetchAll<StudentTaskRow>((from, to) => supabase.from("student_tasks").select("*").range(from, to)),
    fetchAll<BoardCardRow>((from, to) => supabase.from("board_cards").select("*").range(from, to)),
  ]);
  // The streak looks back four more weeks than the report itself.
  const history = await fetchAll<AttendanceRow>((from, to) =>
    supabase.from("attendance").select("*").gte("class_date", subtractDays(week.start, 28)).lt("class_date", week.start).range(from, to),
  );
  const attendanceByStudent = groupBy([...history, ...attendance]);
  const personalByStudent = groupBy(personal);
  const cardsByStudent = groupBy(cards);

  const queue: { student: StudentRow; message: OutgoingEmail }[] = [];
  for (const student of students) {
    if (!student.last_login_at) { bump(summary.skipped, "never signed in"); continue; }
    if (!prefsOf(student, prefs).weekly_digest) { bump(summary.skipped, "turned off by student"); continue; }
    if (prefs.get(student.id)?.last_digest_sent_on === todayIso) { bump(summary.skipped, "already sent today"); continue; }

    const digest = buildWeeklyDigest({
      student,
      attendance: attendanceByStudent.get(student.id) ?? [],
      schedule,
      assignedTasks: assigned,
      personalTasks: personalByStudent.get(student.id) ?? [],
      boardCards: cardsByStudent.get(student.id) ?? [],
      weekStart: week.start,
      todayIso,
    });
    const email = renderWeeklyDigest(digest, siteUrl());
    queue.push({ student, message: { to: student.email!.trim(), ...email } });
  }

  return finish(summary, supabase, queue, "last_digest_sent_on", todayIso);
}

// ---------- personal plan reminder ----------

export async function runPlanReminders(options: RunOptions = {}): Promise<RunSummary> {
  const now = options.now ?? new Date();
  const todayIso = pakistanToday(now);
  const weekday = isoWeekday(todayIso);
  const supabase = createSupabaseAdminClient();
  const summary: RunSummary = { ok: true, kind: "plan-reminder", dryRun: !!options.dryRun, date: todayIso, eligible: 0, sent: 0, failed: [], skipped: {} };

  const [students, prefs] = await Promise.all([loadStudents(supabase, options.onlyStudentId), loadPrefs(supabase, !!options.dryRun)]);
  const personal = await fetchAll<StudentTaskRow>((from, to) => supabase.from("student_tasks").select("*").eq("completed", false).not("planned_date", "is", null).range(from, to));
  const personalByStudent = groupBy(personal);

  const queue: { student: StudentRow; message: OutgoingEmail }[] = [];
  for (const student of students) {
    const p = prefsOf(student, prefs);
    if (!p.plan_reminder) { bump(summary.skipped, "reminder off"); continue; }
    if (!p.reminder_days.includes(weekday)) { bump(summary.skipped, "not a chosen day"); continue; }
    if (prefs.get(student.id)?.last_reminder_sent_on === todayIso) { bump(summary.skipped, "already sent today"); continue; }

    const reminder = buildPlanReminder(student, personalByStudent.get(student.id) ?? [], todayIso);
    if (!reminderHasContent(reminder)) { bump(summary.skipped, "nothing planned"); continue; }
    queue.push({ student, message: { to: student.email!.trim(), ...renderPlanReminder(reminder, siteUrl()) } });
  }

  return finish(summary, supabase, queue, "last_reminder_sent_on", todayIso);
}

async function finish(
  summary: RunSummary,
  supabase: Admin,
  queue: { student: StudentRow; message: OutgoingEmail }[],
  column: "last_digest_sent_on" | "last_reminder_sent_on",
  todayIso: string,
): Promise<RunSummary> {
  summary.eligible = queue.length;

  if (summary.dryRun) {
    summary.preview = queue.map((q) => ({ studentId: q.student.id, to: q.message.to, subject: q.message.subject }));
    return summary;
  }
  if (!emailConfigured()) {
    return { ...summary, ok: false, failed: [{ to: "*", error: "Email is not configured (set RESEND_API_KEY and EMAIL_FROM)" }] };
  }

  const results = await sendMany(queue.map((q) => q.message));
  const sentIds: number[] = [];
  results.forEach((r: SendResult, i) => {
    if (r.ok) {
      sentIds.push(queue[i].student.id);
      summary.sent++;
    } else {
      summary.failed.push({ to: r.to, error: r.error ?? "Unknown error" });
    }
  });
  await recordSent(supabase, sentIds, column, todayIso);
  summary.ok = summary.failed.length === 0;
  return summary;
}

function subtractDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

// ---------- "send me a test email" ----------

export type PreviewResult = { ok: true; sentTo: string } | { ok: false; error: string; retryAfterSeconds?: number };

/** Emails the student a sample of either message, built from their live data. */
export async function sendPreview(studentId: number, kind: "digest" | "reminder", now = new Date()): Promise<PreviewResult> {
  if (!emailConfigured()) return { ok: false, error: "Email sending isn't set up yet. Please ask your teacher." };
  const supabase = createSupabaseAdminClient();

  const students = await loadStudents(supabase, studentId);
  const student = students[0];
  if (!student?.email) return { ok: false, error: "Add your email address first." };

  const { data: prefRow } = await supabase.from("student_email_prefs").select("last_test_at").eq("student_id", studentId).maybeSingle();
  const last = (prefRow as { last_test_at: string | null } | null)?.last_test_at;
  if (last) {
    const wait = TEST_COOLDOWN_SECONDS - Math.floor((now.getTime() - new Date(last).getTime()) / 1000);
    if (wait > 0) return { ok: false, error: `Please wait ${wait} seconds before sending another test.`, retryAfterSeconds: wait };
  }

  const todayIso = pakistanToday(now);
  let message: OutgoingEmail;
  if (kind === "digest") {
    const week = currentWeek(todayIso);
    const [attendance, schedule, assigned, personal, cards] = await Promise.all([
      supabase.from("attendance").select("*").eq("student_id", studentId).gte("class_date", subtractDays(week.start, 28)).then((r) => (r.data ?? []) as AttendanceRow[]),
      supabase.from("class_schedule").select("*").then((r) => (r.data ?? []) as ClassScheduleRow[]),
      supabase.from("tasks").select("*").then((r) => (r.data ?? []) as TaskRow[]),
      supabase.from("student_tasks").select("*").eq("student_id", studentId).then((r) => (r.data ?? []) as StudentTaskRow[]),
      supabase.from("board_cards").select("*").eq("student_id", studentId).then((r) => (r.data ?? []) as BoardCardRow[]),
    ]);
    const digest = buildWeeklyDigest({ student, attendance, schedule, assignedTasks: assigned, personalTasks: personal, boardCards: cards, weekStart: week.start, todayIso });
    message = { to: student.email, ...renderWeeklyDigest(digest, siteUrl()) };
  } else {
    const { data } = await supabase.from("student_tasks").select("*").eq("student_id", studentId).eq("completed", false).not("planned_date", "is", null);
    message = { to: student.email, ...renderPlanReminder(buildPlanReminder(student, (data ?? []) as StudentTaskRow[], todayIso), siteUrl()) };
  }

  const result = await sendOne({ ...message, subject: `[Test] ${message.subject}` });
  if (!result.ok) return { ok: false, error: result.error ?? "Couldn't send the test email" };

  await supabase.from("student_email_prefs").upsert({ student_id: studentId, last_test_at: now.toISOString(), updated_at: now.toISOString() }, { onConflict: "student_id" });
  return { ok: true, sentTo: student.email };
}
