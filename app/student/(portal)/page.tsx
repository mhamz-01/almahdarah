import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { computeStudentStats } from "@/lib/students";
import { colorForSubject, dueMetaFor } from "@/lib/tasks";
import { dailyReflections } from "@/lib/data/reflections";
import { PunchButton } from "@/components/student/punch-button";
import { DailyReflection } from "@/components/student/daily-reflection";
import { FreshTabs, type FreshClass, type FreshTask } from "@/components/student/fresh-tabs";import type {
  AttendanceRow,
  BoardCardRow,
  ClassScheduleRow,
  CourseLessonRow,
  CourseRow,
  LessonProgressRow,
  StudentAuthRow,
  StudentTaskRow,
  TaskRow,
  Weekday,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const WEEKDAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKDAY_BY_UTC_INDEX: (Weekday | null)[] = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", null];

type DayState = "present" | "absent" | "cancelled" | "today" | "upcoming" | "none";

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function streakMessage(streak: number, missedThisWeek: number): string {
  if (streak === 0) {
    return missedThisWeek > 0
      ? "A missed class isn't the end — sit the next one and begin again."
      : "Every streak starts with a single class. Begin this week.";
  }
  if (streak === 1) return "One clean week down. The most beloved deeds are the consistent ones.";
  if (streak < 4) return `${streak} weeks in a row — you're finding your rhythm.`;
  return `${streak} weeks in a row. This is what steady learning looks like.`;
}

function relativeDay(iso: string, todayIso: string): string {
  const day = iso.slice(0, 10);
  if (day === todayIso) return "Today";
  if (day === addDaysIso(todayIso, -1)) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function formatClock(total: number): string {
  const m = Math.floor(total / 60);
  const sec = String(total % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-8 flex items-center gap-4 sm:my-10">
      <span className="font-mono text-[10.5px] tracking-[0.2em] text-muted uppercase">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

const DOT_CLASS: Record<DayState, string> = {
  present: "bg-green text-white",
  absent: "bg-red-600/90 text-white",
  cancelled: "border border-dashed border-gold bg-transparent text-[#8a6b12]",
  today: "bg-primary text-white ring-2 ring-primary/30",
  upcoming: "bg-surface-2 text-muted",
  none: "bg-transparent text-border-strong",
};

export default async function StudentHomePage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);

  const [studentRes, attendanceRes, scheduleRes, coursesRes, assignedRes, personalRes, boardRes, progressRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase.from("attendance").select("*").eq("student_id", session.studentId).order("class_date", { ascending: false }).limit(200),
    supabase.from("class_schedule").select("*").order("sort_order", { ascending: true }),
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
  const schedule = (scheduleRes.data as ClassScheduleRow[] | null) ?? [];
  const stats = computeStudentStats(student, attendance, now);

  // ── Attendance ────────────────────────────────────────────────
  const thisWeek = stats.weeks[0];
  const weekStart = thisWeek.startDate;
  const weekEnd = addDaysIso(weekStart, 6);

  const weekDots = WEEKDAYS.map((day, i) => {
    const slot = schedule.find((s) => s.day === day);
    const iso = addDaysIso(weekStart, i);
    const cell = thisWeek.cells.find((c) => c.day === day);
    let state: DayState;
    if (!slot || iso < student.created_at.slice(0, 10)) state = "none";
    else if (slot.status !== "scheduled") state = "cancelled";
    else if (cell?.status === "present") state = "present";
    else if (cell?.status === "absent") state = "absent";
    else if (iso === todayIso) state = "today";
    else state = "upcoming";
    return {
      day,
      dateNum: Number(iso.slice(8)),
      subject: slot?.subject ?? null,
      time: slot?.start_time ?? null,
      state,
      held: !!slot && slot.status === "scheduled" && iso >= student.created_at.slice(0, 10),
      passed: iso < todayIso,
    };
  });

  const held = weekDots.filter((d) => d.held).length;
  const done = weekDots.filter((d) => d.held && d.passed).length;
  const presentThisWeek = thisWeek.cells.filter((c) => c.status === "present").length;
  const missedThisWeek = thisWeek.cells.filter((c) => c.status === "absent").length;

  // ── Today ─────────────────────────────────────────────────────
  const todayDay = WEEKDAY_BY_UTC_INDEX[now.getUTCDay()];
  const todayClass = todayDay ? (schedule.find((s) => s.day === todayDay) ?? null) : null;
  const alreadyPunched = attendance.some((a) => a.class_date === todayIso && a.status === "present");
  const canPunch = !!todayClass && todayClass.status === "scheduled";

  const todayIdx = todayDay ? WEEKDAYS.indexOf(todayDay) : -1;
  const upcoming = schedule
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day));
  const nextClass = upcoming.find((s) => WEEKDAYS.indexOf(s.day) > todayIdx) ?? upcoming[0] ?? null;

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
  type LessonLite = Pick<CourseLessonRow, "id" | "position" | "title" | "youtube_video_id" | "duration_seconds">;
  interface ResumeCard {
    mode: "resume" | "next" | "start" | "finished";
    courseId: number;
    courseTitle: string;
    lesson: LessonLite | null;
    seconds: number;
    done: number;
    total: number;
  }

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

  const freshClasses: FreshClass[] = newLessons.map((l) => ({
    id: l.id,
    href: `/student/courses/${l.course_id}?lesson=${l.position}`,
    videoId: l.youtube_video_id,
    title: l.title,
    course: courseTitle.get(l.course_id) ?? "",
    when: relativeDay(l.created_at, todayIso),
  }));
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
  const streakDots = Array.from({ length: 8 }, (_, i) => i >= 8 - Math.min(stats.streak, 8));
  const reflections = dailyReflections(now);

  return (
    <div className="max-w-[1040px]">
      <header>
        <span className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">{dateLabel}</span>
        <h1 className="mt-2.5 font-display text-[clamp(26px,3.4vw,38px)] leading-[1.05] tracking-[-0.01em] text-ink">
          Assalamu alaikum, {firstName}
        </h1>
        <p className="mt-2 text-[14.5px] text-text">
          {held === 0
            ? "No classes are scheduled this week."
            : done >= held
              ? "That's every class this week done. Well done."
              : `${held - done} ${held - done === 1 ? "class" : "classes"} left this week.`}
        </p>
      </header>

      {/* Row 1 — the week at a glance + where to pick up learning */}
      <section className="mt-7 grid gap-3 sm:gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-[22px] border border-border bg-surface p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-bold text-ink">Your week</h2>
            <span className="text-[12.5px] text-muted">
              {held === 0 ? "No classes scheduled" : `${presentThisWeek} of ${held} attended`}
            </span>
          </div>
          <ol className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2.5">
            {weekDots.map((d) => (
              <li
                key={d.day}
                className={`flex flex-col items-center rounded-[16px] border px-1 py-3 text-center sm:px-2 ${
                  d.state === "today" ? "border-primary bg-primary/[0.07]" : "border-border"
                }`}
              >
                <span className="font-mono text-[10.5px] tracking-[0.12em] text-muted uppercase">{d.day.slice(0, 3)}</span>
                <span
                  title={d.state === "none" ? "No class" : d.state}
                  className={`mt-2 flex h-8 w-8 items-center justify-center rounded-full font-mono text-[12px] font-bold ${DOT_CLASS[d.state]}`}
                >
                  {d.state === "present"
                    ? "✓"
                    : d.state === "absent"
                      ? "✕"
                      : d.state === "cancelled" || d.state === "none"
                        ? "–"
                        : d.dateNum}
                </span>
                <span className="mt-2 hidden w-full truncate px-1 text-[11.5px] font-semibold text-ink sm:block">
                  {d.state === "cancelled" ? "Cancelled" : (d.subject ?? "No class")}
                </span>
                <span className="font-mono text-[10.5px] text-muted sm:mt-0.5">{d.time ?? ""}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col rounded-[22px] border border-border bg-surface p-5">
          <h2 className="text-[15px] font-bold text-ink">{resume?.mode === "start" ? "Start learning" : "Continue learning"}</h2>
          {resume?.lesson ? (
            <Link
              href={`/student/courses/${resume.courseId}?lesson=${resume.lesson.position}`}
              className="group mt-4 flex flex-1 flex-col justify-between gap-4"
            >
              <span className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${resume.lesson.youtube_video_id}/mqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  className="aspect-video w-[112px] shrink-0 rounded-[12px] bg-surface-2 object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[11px] text-muted">{resume.courseTitle}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[14px] leading-[1.35] font-semibold text-ink group-hover:underline">
                    {resume.lesson.title}
                  </span>
                  {resume.mode === "resume" && resume.seconds > 0 && (
                    <span className="mt-1 block font-mono text-[11px] text-muted">Left off at {formatClock(resume.seconds)}</span>
                  )}
                </span>
              </span>
              <span className="block">
                {resume.total > 0 && (
                  <>
                    <span className="block h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${Math.round((resume.done / resume.total) * 100)}%` }}
                      />
                    </span>
                    <span className="mt-1.5 block text-[12px] text-muted">
                      {resume.done} of {resume.total} lessons complete
                    </span>
                  </>
                )}
                <span className="mt-3 inline-flex h-9 items-center rounded-full bg-primary px-4 text-[13px] font-bold text-white transition group-hover:brightness-[1.08]">
                  {resume.mode === "resume" ? "Resume lesson" : resume.mode === "next" ? "Start next lesson" : "Start first lesson"} →
                </span>
              </span>
            </Link>
          ) : resume?.mode === "finished" ? (
            <div className="mt-4 flex flex-1 flex-col justify-between gap-4">
              <p className="text-[13.5px] leading-[1.55] text-text">
                You&apos;ve finished every lesson in <span className="font-semibold text-ink">{resume.courseTitle}</span>. Masha&apos;Allah —
                pick your next course.
              </p>
              <Link href="/student/courses" className="inline-flex h-9 w-fit items-center rounded-full bg-primary px-4 text-[13px] font-bold text-white">
                Browse courses →
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-[13.5px] text-muted">No courses are available yet. Check back soon, in sha Allah.</p>
          )}
        </div>
      </section>

      {/* Row 2 — streak + today, one card */}
      <section className="mt-3 grid overflow-hidden rounded-[22px] bg-navy text-white sm:mt-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col justify-between p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-gold uppercase">Your streak</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-[40px] leading-none">{stats.streak}</span>
                <span className="text-[14px] text-white/80">{stats.streak === 1 ? "week" : "weeks"} in a row</span>
              </div>
            </div>
            <span
              aria-hidden
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                stats.streak > 0 ? "bg-gold text-navy" : "bg-white/10 text-white/60"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12.6 2.2c.3 2.6-.6 4.2-2 5.8-1.3 1.5-2.6 3-2.6 5.2 0 1.3.5 2.4 1.3 3.2-.1-1.9.8-3 1.9-4 1-.9 1.7-1.9 1.9-3.4 2.7 1.8 4.4 4.6 4.4 7.3A6.5 6.5 0 0 1 12 18.5a6.5 6.5 0 0 1-6.5-6.5c0-4.7 4-7 7.1-9.8Z" />
              </svg>
            </span>
          </div>
          <div>
            <p className="mt-3 max-w-[44ch] text-[13.5px] leading-[1.5] text-white/85">
              {streakMessage(stats.streak, missedThisWeek)}
            </p>
            <div className="mt-3 flex gap-1.5">
              {streakDots.map((filled, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${filled ? "bg-gold" : "bg-white/15"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-white/15 p-5 sm:p-6 lg:border-t-0 lg:border-l">
          {todayClass ? (
            <>
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] text-gold uppercase">Today&apos;s class</div>
                <div className="mt-2 font-display text-[22px] leading-[1.15] text-white">{todayClass.subject}</div>
                <div className="mt-1.5 font-mono text-[12px] text-white/70">
                  {todayClass.start_time} · {todayClass.teacher}
                </div>
              </div>
              <div className="mt-5">
                {canPunch ? (
                  <PunchButton punched={alreadyPunched} onDark />
                ) : (
                  <span className="inline-flex h-10 items-center rounded-full bg-gold/25 px-4 text-[12.5px] font-bold text-gold">
                    {todayClass.status === "cancelled" ? "Cancelled this week" : "Rescheduled"}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-gold uppercase">No class today</div>
              <div className="mt-2 font-display text-[22px] leading-[1.15] text-white">A day to revise</div>
              {nextClass && (
                <div className="mt-1.5 text-[13px] text-white/80">
                  Next up: <span className="font-semibold text-white">{nextClass.subject}</span>
                  <span className="font-mono text-[12px] text-white/70">
                    {" "}· {nextClass.day.slice(0, 3)} {nextClass.start_time}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Divider label="Fresh for you" />

      {/* Row 3 — new classes + tasks */}
      <FreshTabs classes={freshClasses} tasks={freshTasks} />

      <Divider label="For the seeker of knowledge" />

      <DailyReflection items={reflections} />
    </div>
  );
}
