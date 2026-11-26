import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { addDaysIso, computeStudentStats, slotOn } from "@/lib/students";
import { loadStudentStreakContext } from "@/lib/class-calendar";
import { colorForSubject, dueMetaFor } from "@/lib/tasks";
import { dailyReflections } from "@/lib/data/reflections";
import { NextBadgeCard, StreakCard, StreakHelp, type TodayInfo } from "@/components/student/streak-panel";
import { DailyReflection } from "@/components/student/daily-reflection";
import { ContinueLearning, type ResumeCard, type ResumeLesson } from "@/components/student/continue-learning";
import { FreshTabs, type FreshClass, type FreshTask } from "@/components/student/fresh-tabs";import type {
  AttendanceRow,
  BoardCardRow,
  CourseLessonRow,
  CourseRow,
  LessonProgressRow,
  StudentAuthRow,
  StudentTaskRow,
  TaskRow,
} from "@/lib/types";

export const dynamic = "force-dynamic";


function relativeDay(iso: string, todayIso: string): string {
  const day = iso.slice(0, 10);
  if (day === todayIso) return "Today";
  if (day === addDaysIso(todayIso, -1)) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-8 flex items-center gap-4 sm:my-10">
      <span className="font-mono text-[10.5px] tracking-[0.2em] text-muted uppercase">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export default async function StudentHomePage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);

  const [studentRes, attendanceRes, coursesRes, assignedRes, personalRes, boardRes, progressRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase.from("attendance").select("*").eq("student_id", session.studentId).order("class_date", { ascending: false }).limit(1000),
    supabase.from("courses").select("id, title, sort_order").eq("published", true).order("sort_order", { ascending: true }),
    supabase.from("tasks").select("*"),
    supabase.from("student_tasks").select("*").eq("student_id", session.studentId),
    supabase.from("board_cards").select("*").eq("student_id", session.studentId),
    supabase
      .from("lesson_progress")
      .select("*")
      .eq("student_id", session.studentId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const student = studentRes.data as StudentAuthRow | null;
  if (!student) redirect("/student/login");

  const attendance = (attendanceRes.data as AttendanceRow[] | null) ?? [];
  const { calendar, ctx } = await loadStudentStreakContext(supabase, student.id, student.created_at);
  const stats = computeStudentStats(student, attendance, now, ctx);

  // ── This week ─────────────────────────────────────────────────
  const thisWeek = stats.weeks[0];
  const weekStart = thisWeek.startDate;
  const weekEnd = addDaysIso(weekStart, 6);

  // ── Today / next class ────────────────────────────────────────
  const todayClass = slotOn(calendar.schedule, todayIso);
  const cancelledToday = ctx.cancelledDates.has(todayIso);
  const alreadyPunched = attendance.some((a) => a.class_date === todayIso && a.status === "present");
  let nextClass: TodayInfo["next"] = null;
  for (let d = 1; d <= 14 && !nextClass; d++) {
    const iso = addDaysIso(todayIso, d);
    const slot = slotOn(calendar.schedule, iso);
    if (slot && !ctx.cancelledDates.has(iso)) {
      const label = new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
      nextClass = { subject: slot.subject, label: `${d === 1 ? "Tomorrow" : label} at ${slot.start_time}` };
    }
  }
  const today: TodayInfo = { slot: todayClass, cancelled: cancelledToday, punched: alreadyPunched, next: nextClass };
  const timeByDay = Object.fromEntries(calendar.schedule.map((s) => [s.day, s.start_time]));

  // ── New lessons this week ─────────────────────────────────────
  const courses = (coursesRes.data as Pick<CourseRow, "id" | "title" | "sort_order">[] | null) ?? [];
  const courseTitle = new Map(courses.map((c) => [c.id, c.title]));
  const lessonsRes = courses.length
    ? await supabase
        .from("course_lessons")
        .select("id, course_id, position, title, youtube_video_id, created_at")
        .in("course_id", courses.map((c) => c.id))
        .gte("created_at", `${weekStart}T00:00:00Z`)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] as CourseLessonRow[] };
  const newLessons = (lessonsRes.data as CourseLessonRow[] | null) ?? [];

  // ── Continue learning ─────────────────────────────────────────
  type LessonLite = ResumeLesson;

  const LESSON_COLS = "id, position, title, youtube_video_id, duration_seconds";
  const latestProgress = progressRes.data as LessonProgressRow | null;
  let resume: ResumeCard | null = null;

  if (latestProgress) {
    const { data: current } = await supabase
      .from("course_lessons")
      .select(`course_id, ${LESSON_COLS}`)
      .eq("id", latestProgress.lesson_id)
      .maybeSingle();
    const currentCourse = current ? courses.find((c) => c.id === current.course_id) : undefined;

    if (current && currentCourse) {
      const { data: siblingRows } = await supabase
        .from("course_lessons")
        .select(LESSON_COLS)
        .eq("course_id", current.course_id)
        .order("position", { ascending: true });
      const siblings = (siblingRows as LessonLite[] | null) ?? [];
      const { data: doneRows } = siblings.length
        ? await supabase
            .from("lesson_progress")
            .select("lesson_id")
            .eq("student_id", session.studentId)
            .eq("completed", true)
            .in("lesson_id", siblings.map((l) => l.id))
        : { data: [] as { lesson_id: number }[] };
      const doneIds = new Set((doneRows ?? []).map((r) => r.lesson_id));
      const next = siblings.find((l) => l.position > current.position && !doneIds.has(l.id)) ?? null;
      const base = { courseId: current.course_id, courseTitle: currentCourse.title, done: doneIds.size, total: siblings.length };

      if (!latestProgress.completed) {
        resume = { ...base, mode: "resume", lesson: current as LessonLite, seconds: latestProgress.last_position_seconds };
      } else if (next) {
        resume = { ...base, mode: "next", lesson: next, seconds: 0 };
      } else {
        resume = { ...base, mode: "finished", lesson: null, seconds: 0 };
      }
    }
  }

  if (!resume && courses[0]) {
    const first = courses[0];
    const { data: firstRows } = await supabase
      .from("course_lessons")
      .select(LESSON_COLS)
      .eq("course_id", first.id)
      .order("position", { ascending: true })
      .limit(1);
    const lesson = ((firstRows as LessonLite[] | null) ?? [])[0] ?? null;
    if (lesson) resume = { mode: "start", courseId: first.id, courseTitle: first.title, lesson, seconds: 0, done: 0, total: 0 };
  }

  // ── Tasks that need attention this week ───────────────────────
  const boardDone = new Set<string>();
  for (const card of (boardRes.data as BoardCardRow[] | null) ?? []) {
    if (card.status !== "done") continue;
    if (card.assigned_task_id) boardDone.add(`a${card.assigned_task_id}`);
    if (card.personal_task_id) boardDone.add(`p${card.personal_task_id}`);
  }

  interface HomeTask {
    key: string;
    title: string;
    subject: string | null;
    due: string | null;
    created: string;
    description: string;
    kind: "assigned" | "personal";
    attachments: number;
    planned: string | null;
  }
  const candidates: HomeTask[] = [
    ...((assignedRes.data as TaskRow[] | null) ?? [])
      .filter((t) => !boardDone.has(`a${t.id}`))
      .map((t) => ({ key: `a${t.id}`, title: t.title, subject: t.subject, due: t.due_date, created: t.created_at, description: t.description, kind: "assigned" as const, attachments: t.attachment_url ? 1 : 0, planned: null })),
    ...((personalRes.data as StudentTaskRow[] | null) ?? [])
      .filter((t) => !t.completed && !boardDone.has(`p${t.id}`))
      .map((t) => ({ key: `p${t.id}`, title: t.title, subject: t.subject, due: t.due_date, created: t.created_at, description: t.description, kind: "personal" as const, attachments: t.attachments?.length ?? 0, planned: t.planned_date })),
  ];
  // Due by Sunday (overdue included), or undated and added this week.
  const weekTasks = candidates
    .filter((t) => (t.due ? t.due <= weekEnd : t.created.slice(0, 10) >= weekStart))
    .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));

  // Missed classes come first: catching up on them keeps the streak.
  const missedClasses: FreshClass[] = stats.catchUps.map((item) => ({
    id: `missed-${item.date}`,
    href: item.lesson ? `/student/courses/${item.lesson.courseId}?lesson=${item.lesson.position}` : "/student/attendance",
    videoId: item.lesson?.videoId ?? null,
    title: item.lesson?.title ?? item.subject,
    course: item.subject,
    when: item.day.slice(0, 3),
    missed: {
      state: item.state,
      deadline: item.deadline,
      pct: item.durationSeconds ? Math.min(100, Math.round((item.watchedSeconds / item.durationSeconds) * 100)) : 0,
    },
  }));
  const missedLessonIds = new Set(stats.catchUps.flatMap((c) => (c.lesson ? [c.lesson.id] : [])));

  const uploadedClasses: FreshClass[] = newLessons.filter((l) => !missedLessonIds.has(l.id)).map((l) => ({
    id: l.id,
    href: `/student/courses/${l.course_id}?lesson=${l.position}`,
    videoId: l.youtube_video_id,
    title: l.title,
    course: courseTitle.get(l.course_id) ?? "",
    when: relativeDay(l.created_at, todayIso),
  }));
  const freshClasses = [...missedClasses, ...uploadedClasses];
  const freshTasks: FreshTask[] = weekTasks.map((t) => {
    const due = dueMetaFor(t.due, now);
    return {
      key: t.key,
      href: "/student/tasks",
      title: t.title,
      subject: t.subject ?? "Personal",
      color: colorForSubject(t.subject ?? t.title),
      dueLabel: due?.label ?? null,
      dueBadgeClass: due?.badgeClass ?? null,
      description: t.description.trim(),
      kind: t.kind,
      attachments: t.attachments,
      planned: t.planned
        ? new Date(`${t.planned}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })
        : null,
    };
  });

  // ── Header / streak ───────────────────────────────────────────
  const firstName = student.name.split(" ")[0];
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const reflections = dailyReflections(now);

  return (
    <div className="max-w-[1040px]">
      <header>
        <span className="font-mono text-[12px] tracking-[0.1em] text-primary uppercase">{dateLabel}</span>
        <h1 className="mt-2.5 font-display text-[clamp(26px,3.4vw,38px)] leading-[1.05] tracking-[-0.01em] text-ink">
          Assalamu alaikum, {firstName}
        </h1>
      </header>

      <StreakCard stats={stats} today={today} todayIso={todayIso} timeByDay={timeByDay} />

      <section className="mt-3 grid items-stretch gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ContinueLearning resume={resume} />
        <NextBadgeCard stats={stats} />
      </section>

      <Divider label="Fresh for you" />

      {/* Row 3 — new classes + tasks */}
      <FreshTabs classes={freshClasses} tasks={freshTasks} />

      <Divider label="For the seeker of knowledge" />

      <DailyReflection items={reflections} />

      <StreakHelp />
    </div>
  );
}
