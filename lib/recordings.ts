// Links each held class to its recording, automatically.
//
// The nightly course sync pulls new videos from each course's YouTube playlist.
// Right after, every held (not cancelled) class from the last two weeks that has
// no recording yet gets the oldest unused lesson of its course that was added on
// or after the class date. The class's course is the one set on the timetable
// row, or else the course whose title best matches the class name.
//
// Students who missed that class are then emailed: "the recording is ready,
// watch it within 7 days to keep your streak".

import { computeStatsForStudents, loadClassCalendar } from "@/lib/class-calendar";
import { emailConfigured, sendMany, siteUrl, type OutgoingEmail } from "@/lib/email/send";
import { renderCatchUpReady, renderCatchUpReminder, type CatchUpEmail } from "@/lib/email/templates";
import { LINK_LOOKBACK_DAYS, resolveRecordingLinks, type LinkPlanInput, type PlannedLink } from "@/lib/recordings-match";
import { addDaysIso, toIsoDate } from "@/lib/students";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ClassRecordingRow, CourseRow, StudentRow, StudentWithStats } from "@/lib/types";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

// ── Doing it ─────────────────────────────────────────────────────────────────

export interface LinkSummary {
  linked: PlannedLink[];
  emailed: number;
  emailErrors: string[];
}

/** Links new recordings, then emails the students who missed those classes. */
export async function linkRecordings(now = new Date()): Promise<LinkSummary> {
  const supabase = createSupabaseAdminClient();
  const todayIso = toIsoDate(now);
  const from = addDaysIso(todayIso, -LINK_LOOKBACK_DAYS);

  const [calendar, coursesRes, existingRes, lessonsRes] = await Promise.all([
    loadClassCalendar(supabase, from, now),
    supabase.from("courses").select("id, title"),
    supabase.from("class_recordings").select("class_date, lesson_id, source"),
    supabase.from("course_lessons").select("id, course_id, position, created_at").gte("created_at", `${from}T00:00:00Z`),
  ]);
  if (existingRes.error) throw new Error(existingRes.error.message);
  const courses = (coursesRes.data as Pick<CourseRow, "id" | "title">[] | null) ?? [];
  const lessons = (lessonsRes.data as LinkPlanInput["lessons"] | null) ?? [];
  const cancelledDates = new Set(calendar.cancellations.map((c) => c.class_date));
  const existing = (existingRes.data as Pick<ClassRecordingRow, "class_date" | "lesson_id" | "source">[] | null) ?? [];
  const existingByDate = new Map(existing.map((r) => [r.class_date, r]));

  // This week: the latest video of the class's course (late uploads included).
  // Older classes: matched by upload batches.
  const { thisWeek, older } = resolveRecordingLinks({ schedule: calendar.schedule, courses, cancelledDates, existing, lessons, todayIso });
  const repoint: (PlannedLink & { linked_at: string })[] = [];
  const weekPlan: PlannedLink[] = [];
  for (const [date, pick] of thisWeek) {
    const link = { class_date: date, schedule_id: pick.scheduleId, lesson_id: pick.lessonId };
    const current = existingByDate.get(date);
    if (!current) weekPlan.push(link);
    else if (current.lesson_id !== pick.lessonId) repoint.push({ ...link, linked_at: pick.addedAt });
  }
  for (const r of repoint) {
    await supabase.from("class_recordings").update({ lesson_id: r.lesson_id, schedule_id: r.schedule_id, linked_at: r.linked_at }).eq("class_date", r.class_date).eq("source", "auto");
  }

  const plan: PlannedLink[] = [...weekPlan, ...older.map(({ class_date, schedule_id, lesson_id }) => ({ class_date, schedule_id, lesson_id }))];

  const summary: LinkSummary = { linked: [], emailed: 0, emailErrors: [] };
  if (!plan.length) return summary;

  const { data: inserted, error } = await supabase
    .from("class_recordings")
    .upsert(plan.map((p) => ({ ...p, source: "auto", linked_at: now.toISOString() })), { onConflict: "class_date", ignoreDuplicates: true })
    .select("class_date, schedule_id, lesson_id");
  if (error) throw new Error(error.message);
  summary.linked = (inserted as PlannedLink[] | null) ?? [];

  const result = await emailCatchUpReady(supabase, summary.linked.map((l) => l.class_date), now);
  summary.emailed = result.sent;
  summary.emailErrors = result.errors;
  return summary;
}

type EmailStudent = StudentRow & { last_login_at: string | null };

async function loadEmailStudents(supabase: Admin): Promise<EmailStudent[]> {
  const { data } = await supabase
    .from("students")
    .select("id, created_at, name, username, avatar_color, email, phone, last_login_at")
    .not("email", "is", null);
  return ((data ?? []) as EmailStudent[]).filter((s) => s.email?.trim() && s.last_login_at);
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function catchUpHref(item: StudentWithStats["catchUps"][number]): string {
  return item.lesson ? `${siteUrl()}/student/courses/${item.lesson.courseId}?lesson=${item.lesson.position}` : `${siteUrl()}/student`;
}

/** "Recording ready" for the students whose open catch-up is one of `classDates`. */
async function emailCatchUpReady(supabase: Admin, classDates: string[], now: Date): Promise<{ sent: number; errors: string[] }> {
  if (!classDates.length || !emailConfigured()) return { sent: 0, errors: [] };
  const students = await loadEmailStudents(supabase);
  const { stats } = await computeStatsForStudents(supabase, students, now);

  const messages: OutgoingEmail[] = [];
  for (const s of students) {
    const st = stats.get(s.id);
    if (!st) continue;
    for (const item of st.catchUps) {
      if (item.state !== "ready" || !item.lesson || !classDates.includes(item.date)) continue;
      const data: CatchUpEmail = {
        firstName: firstName(s.name),
        subject: item.subject,
        classDate: item.date,
        lessonTitle: item.lesson.title,
        deadline: item.deadline,
        streak: st.streak,
        href: catchUpHref(item),
      };
      messages.push({ to: s.email!.trim(), ...renderCatchUpReady(data, siteUrl()) });
    }
  }
  if (!messages.length) return { sent: 0, errors: [] };
  const results = await sendMany(messages);
  await supabase.from("class_recordings").update({ notified_at: now.toISOString() }).in("class_date", classDates);
  return { sent: results.filter((r) => r.ok).length, errors: results.filter((r) => !r.ok).map((r) => `${r.to}: ${r.error}`) };
}

/** Daily: remind students whose catch-up deadline is 2 days away and who haven't finished. */
export async function runCatchUpReminders(now = new Date()): Promise<{ sent: number; skipped: number; errors: string[] }> {
  const out = { sent: 0, skipped: 0, errors: [] as string[] };
  if (!emailConfigured()) return out;
  const supabase = createSupabaseAdminClient();
  const todayIso = toIsoDate(now);
  const students = await loadEmailStudents(supabase);
  const { stats } = await computeStatsForStudents(supabase, students, now);

  const { data: prefRows } = await supabase.from("student_email_prefs").select("student_id, last_catch_up_sent_on");
  const sentToday = new Set(
    ((prefRows ?? []) as { student_id: number; last_catch_up_sent_on: string | null }[])
      .filter((p) => p.last_catch_up_sent_on === todayIso)
      .map((p) => p.student_id),
  );

  const queue: { id: number; message: OutgoingEmail }[] = [];
  for (const s of students) {
    const st = stats.get(s.id);
    const item = st?.catchUps.find((c) => c.state === "ready" && c.lesson && c.deadline === addDaysIso(todayIso, 2));
    if (!st || !item?.lesson) continue;
    if (sentToday.has(s.id)) {
      out.skipped++;
      continue;
    }
    queue.push({
      id: s.id,
      message: {
        to: s.email!.trim(),
        ...renderCatchUpReminder(
          {
            firstName: firstName(s.name),
            subject: item.subject,
            classDate: item.date,
            lessonTitle: item.lesson.title,
            deadline: item.deadline,
            streak: st.streak,
            href: catchUpHref(item),
            daysLeft: 2,
          },
          siteUrl(),
        ),
      },
    });
  }
  if (!queue.length) return out;

  const results = await sendMany(queue.map((q) => q.message));
  const sentIds = queue.filter((_, i) => results[i]?.ok).map((q) => q.id);
  out.sent = sentIds.length;
  out.errors = results.filter((r) => !r.ok).map((r) => `${r.to}: ${r.error}`);
  if (sentIds.length) {
    await supabase
      .from("student_email_prefs")
      .upsert(sentIds.map((student_id) => ({ student_id, last_catch_up_sent_on: todayIso, updated_at: now.toISOString() })), { onConflict: "student_id" });
  }
  return out;
}
