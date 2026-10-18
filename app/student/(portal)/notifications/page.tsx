import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { computeStudentStats } from "@/lib/students";
import { MarkAllReadButton } from "@/components/student/mark-all-read-button";
import type {
  AttendanceRow,
  ClassScheduleRow,
  CourseLessonRow,
  CourseRow,
  LessonNoteRow,
  StudentAuthRow,
  StudentNoteRow,
} from "@/lib/types";

// How long a "new lecture notes" / "new class" notice stays in the feed.
const NEW_NOTES_DAYS = 14;

export const dynamic = "force-dynamic";

interface Notice {
  key: string;
  kind: string;
  barClass: string;
  labelClass: string;
  time: Date;
  timeLabel: string;
  title: string;
  body: string;
  unread: boolean;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function relativeDayLabel(time: Date, now: Date): string {
  const diffMs = now.getTime() - time.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return diffMinutes <= 1 ? "Just now" : `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24 && now.getUTCDate() === time.getUTCDate()) return `${diffHours}h ago`;
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startOfThat = Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate());
  const dayDiff = Math.round((startOfToday - startOfThat) / 86400000);
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  return time.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export default async function StudentNotificationsPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const newNotesSince = new Date();
  newNotesSince.setUTCDate(newNotesSince.getUTCDate() - NEW_NOTES_DAYS);
  const [studentRes, attendanceRes, scheduleRes, notesRes, lectureNotesRes, newLessonsRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase.from("attendance").select("*").eq("student_id", session.studentId).order("class_date", { ascending: false }).limit(60),
    supabase.from("class_schedule").select("*").order("sort_order", { ascending: true }),
    supabase.from("student_notes").select("*").eq("student_id", session.studentId).order("created_at", { ascending: false }).limit(50),
    supabase
      .from("lesson_notes")
      .select("lesson_id, published_at")
      .gte("published_at", newNotesSince.toISOString())
      .order("published_at", { ascending: false })
      .limit(20),
    supabase
      .from("course_lessons")
      .select("id, course_id, position, title, created_at")
      .gte("created_at", newNotesSince.toISOString())
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const student = studentRes.data as StudentAuthRow | null;
  if (!student) redirect("/student/login");

  const attendance = (attendanceRes.data as AttendanceRow[] | null) ?? [];
  const schedule = (scheduleRes.data as ClassScheduleRow[] | null) ?? [];
  const notes = (notesRes.data as StudentNoteRow[] | null) ?? [];
  const lectureNotes = (lectureNotesRes.data as Pick<LessonNoteRow, "lesson_id" | "published_at">[] | null) ?? [];
  const newLessons =
    (newLessonsRes.data as Pick<CourseLessonRow, "id" | "course_id" | "position" | "title" | "created_at">[] | null) ?? [];
  const now = new Date();
  const stats = computeStudentStats(student, attendance, now);

  // Lesson + course titles for recently published lecture notes.
  const noteLessonsRes = lectureNotes.length
    ? await supabase
        .from("course_lessons")
        .select("id, course_id, position, title")
        .in("id", lectureNotes.map((n) => n.lesson_id))
    : { data: [] };
  const noteLessons = (noteLessonsRes.data as Pick<CourseLessonRow, "id" | "course_id" | "position" | "title">[] | null) ?? [];
  const courseIds = [...new Set([...noteLessons, ...newLessons].map((l) => l.course_id))];
  const noteCoursesRes = courseIds.length
    ? await supabase.from("courses").select("id, title").eq("published", true).in("id", courseIds)
    : { data: [] };
  const noteCourses = new Map(
    ((noteCoursesRes.data as Pick<CourseRow, "id" | "title">[] | null) ?? []).map((c) => [c.id, c.title]),
  );
  const noteLessonsById = new Map(noteLessons.map((l) => [l.id, l]));

  const notices: Notice[] = [];

  for (const note of notes) {
    notices.push({
      key: `note-${note.id}`,
      kind: "Note from your teacher",
      barClass: "bg-primary",
      labelClass: "text-primary",
      time: new Date(note.created_at),
      timeLabel: "",
      title: note.body.length > 80 ? `${note.body.slice(0, 77)}…` : note.body,
      body: note.body,
      unread: !note.read,
    });
  }

  for (const lesson of newLessons) {
    const courseTitle = noteCourses.get(lesson.course_id);
    if (!courseTitle) continue;
    notices.push({
      key: `new-class-${lesson.id}`,
      kind: "New class",
      barClass: "bg-primary",
      labelClass: "text-primary",
      time: new Date(lesson.created_at),
      timeLabel: "",
      title: `New class uploaded: “${lesson.title}”`,
      body: `${courseTitle} · Lesson ${lesson.position}. Open it in Courses to watch.`,
      unread: false,
    });
  }

  for (const note of lectureNotes) {
    const lesson = noteLessonsById.get(note.lesson_id);
    const courseTitle = lesson && noteCourses.get(lesson.course_id);
    if (!lesson || !courseTitle || !note.published_at) continue;
    notices.push({
      key: `lecture-notes-${note.lesson_id}`,
      kind: "New lecture notes",
      barClass: "bg-primary-2",
      labelClass: "text-primary",
      time: new Date(note.published_at),
      timeLabel: "",
      title: `Notes are ready for “${lesson.title}”`,
      body: `${courseTitle} · Lesson ${lesson.position}. Open the lesson in Courses — the notes are under the video.`,
      unread: false,
    });
  }

  for (const slot of schedule) {
    if (slot.status === "scheduled") continue;
    const kind = slot.status === "cancelled" ? "Class cancelled" : "Schedule change";
    const title =
      slot.status === "cancelled"
        ? `${slot.day}’s ${slot.subject} is cancelled`
        : `${slot.subject} moves to ${slot.start_time}`;
    const body =
      slot.note ||
      (slot.status === "cancelled"
        ? "No session this week. Your streak is not affected by a cancelled class."
        : `Note the new time for this week’s ${slot.day} session.`);
    notices.push({
      key: `schedule-${slot.id}`,
      kind,
      barClass: "bg-red-600",
      labelClass: "text-red-600",
      time: new Date(slot.published_at ?? slot.updated_at),
      timeLabel: "",
      title,
      body,
      unread: false,
    });
  }

  // A handful of recent missed classes, most recent first.
  const scheduleByDay = new Map(schedule.map((s) => [s.day, s]));
  let missedShown = 0;
  for (const week of stats.weeks) {
    if (missedShown >= 4) break;
    week.cells.forEach((cell, dayIndex) => {
      if (missedShown >= 4 || cell.status !== "absent") return;
      const classDate = addDaysIso(week.startDate, dayIndex);
      const subject = scheduleByDay.get(cell.day)?.subject ?? cell.day;
      const teacher = scheduleByDay.get(cell.day)?.teacher;
      notices.push({
        key: `missed-${classDate}`,
        kind: "Missed class",
        barClass: "bg-red-600",
      labelClass: "text-red-600",
        time: new Date(`${classDate}T12:00:00Z`),
        timeLabel: "",
        title: `${subject} on ${cell.day} was marked absent`,
        body: teacher ? `Speak to ${teacher} if this was recorded in error.` : "Speak to your teacher if this was recorded in error.",
        unread: false,
      });
      missedShown++;
    });
  }

  // streak === 0 means two different things: an actual missed class broke a
  // run (missedTotal > 0), or this student simply hasn't completed a full
  // week yet (a new enrollment, or their very first week in the system) —
  // only the former is a "reset".
  const hasEverMissed = stats.missedTotal > 0;
  notices.push({
    key: "streak",
    kind: "Streak",
    barClass: "bg-gold",
    labelClass: "text-[#8a6b12]",
    time: now,
    timeLabel: "",
    title:
      stats.streak > 0
        ? `${stats.streak} week${stats.streak === 1 ? "" : "s"} unbroken — keep it steady`
        : hasEverMissed
          ? "Your streak has reset — begin again this week"
          : "Your streak starts this week",
    body:
      stats.streak > 0
        ? `You have not missed a class in ${stats.streak} week${stats.streak === 1 ? "" : "s"}. Sit through this week and it becomes ${stats.streak + 1}.`
        : hasEverMissed
          ? "A missed class ended your run. Sit every class this week and the count starts at one."
          : "Sit every class this week and your streak count begins.",
    unread: false,
  });

  // A student only sees notices from the day their account was created onwards.
  const joinedAt = new Date(`${student.created_at.slice(0, 10)}T00:00:00Z`).getTime();
  const feed = notices.filter((n) => n.time.getTime() >= joinedAt);

  feed.sort((a, b) => b.time.getTime() - a.time.getTime());
  for (const n of feed) n.timeLabel = relativeDayLabel(n.time, now);

  const unreadCount = feed.filter((n) => n.unread).length;

  return (
    <div className="max-w-[760px]">
      <span className="font-mono text-[11px] tracking-[0.26em] text-muted uppercase">
        {unreadCount ? `${unreadCount} unread` : "All caught up"}
      </span>
      <h1 className="mt-3.5 mb-2.5 font-display text-[clamp(28px,3.6vw,42px)] leading-none tracking-[-0.01em] text-ink uppercase">
        Notifications
      </h1>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3.5">
        <p className="m-0 text-[15px] leading-[1.65] text-text">Class reminders, teacher notes, and streak alerts.</p>
        <MarkAllReadButton disabled={unreadCount === 0} />
      </div>

      <div className="overflow-hidden rounded-[3px] border border-border">
        {feed.map((n) => (
          <div
            key={n.key}
            className={`grid grid-cols-[4px_1fr_auto] items-start gap-4 border-b border-border px-[22px] py-5 last:border-b-0 ${
              n.unread ? "bg-surface" : "bg-bg"
            }`}
          >
            <span className={`self-stretch rounded-full ${n.barClass}`} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className={`text-[10.5px] font-bold tracking-[0.12em] uppercase ${n.labelClass}`}>
                  {n.kind}
                </span>
                <span className="font-mono text-[11px] text-muted">{n.timeLabel}</span>
              </div>
              <div className={`mt-2 text-[14.5px] text-ink ${n.unread ? "font-bold" : "font-medium"}`}>{n.title}</div>
              <div className="mt-[5px] text-[13.5px] leading-[1.6] text-text">{n.body}</div>
            </div>
            {n.unread && <span className="mt-1.5 h-[9px] w-[9px] rounded-full bg-red-600" />}
          </div>
        ))}
        {feed.length === 0 && <p className="px-[22px] py-10 text-center text-muted">Nothing here yet.</p>}
      </div>
    </div>
  );
}
