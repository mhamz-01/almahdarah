import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { computeStudentStats } from "@/lib/students";
import { colorForSubject, dueMetaFor } from "@/lib/tasks";
import { dailyReflections } from "@/lib/data/reflections";
import { PunchButton } from "@/components/student/punch-button";
import { DailyReflection } from "@/components/student/daily-reflection";
import type {
  AttendanceRow,
  BoardCardRow,
  ClassScheduleRow,
  CourseLessonRow,
  CourseRow,
  StudentAuthRow,
  StudentTaskRow,
  TaskRow,
  Weekday,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const WEEKDAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKDAY_BY_UTC_INDEX: (Weekday | null)[] = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", null];
const MAX_ITEMS = 3;

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

  const [studentRes, attendanceRes, scheduleRes, coursesRes, assignedRes, personalRes, boardRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase.from("attendance").select("*").eq("student_id", session.studentId).order("class_date", { ascending: false }).limit(200),
    supabase.from("class_schedule").select("*").order("sort_order", { ascending: true }),
    supabase.from("courses").select("id, title").eq("published", true),
    supabase.from("tasks").select("*"),
    supabase.from("student_tasks").select("*").eq("student_id", session.studentId),
    supabase.from("board_cards").select("*").eq("student_id", session.studentId),
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
    if (!slot) state = "none";
    else if (slot.status !== "scheduled") state = "cancelled";
    else if (cell?.status === "present") state = "present";
    else if (cell?.status === "absent") state = "absent";
    else if (iso === todayIso) state = "today";
    else state = "upcoming";
    return { day, letter: day[0], state, held: !!slot && slot.status === "scheduled", passed: iso < todayIso };
  });

  const held = weekDots.filter((d) => d.held).length;
  const done = weekDots.filter((d) => d.held && d.passed).length;
  const presentThisWeek = thisWeek.cells.filter((c) => c.status === "present").length;
  const missedThisWeek = thisWeek.cells.filter((c) => c.status === "absent").length;

  const allCells = stats.weeks.flatMap((w) => w.cells);
  const presentAll = allCells.filter((c) => c.status === "present").length;
  const absentAll = allCells.filter((c) => c.status === "absent").length;
  const overallPct = presentAll + absentAll > 0 ? Math.round((presentAll / (presentAll + absentAll)) * 100) : null;

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
  const courses = (coursesRes.data as Pick<CourseRow, "id" | "title">[] | null) ?? [];
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
  }
  const candidates: HomeTask[] = [
    ...((assignedRes.data as TaskRow[] | null) ?? [])
      .filter((t) => !boardDone.has(`a${t.id}`))
      .map((t) => ({ key: `a${t.id}`, title: t.title, subject: t.subject, due: t.due_date, created: t.created_at })),
    ...((personalRes.data as StudentTaskRow[] | null) ?? [])
      .filter((t) => !t.completed && !boardDone.has(`p${t.id}`))
      .map((t) => ({ key: `p${t.id}`, title: t.title, subject: t.subject, due: t.due_date, created: t.created_at })),
  ];
  // Due by Sunday (overdue included), or undated and added this week.
  const weekTasks = candidates
    .filter((t) => (t.due ? t.due <= weekEnd : t.created.slice(0, 10) >= weekStart))
    .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));

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

      {/* Row 1 — attendance numbers */}
      <section aria-label="Attendance overview" className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="col-span-2 rounded-[22px] border border-border bg-surface p-5 sm:col-span-1">
          <div className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Attendance · this week</div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-[34px] leading-none text-ink">{presentThisWeek}</span>
            <span className="text-[14px] text-muted">of {held} classes</span>
          </div>
          <div className="mt-4 flex gap-2" role="img" aria-label={`Attended ${presentThisWeek} of ${held} classes this week`}>
            {weekDots.map((d) => (
              <span
                key={d.day}
                title={`${d.day}: ${d.state === "none" ? "no class" : d.state}`}
                className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10.5px] font-bold ${DOT_CLASS[d.state]}`}
              >
                {d.state === "present" ? "✓" : d.letter}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-surface p-5">
          <div className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Overall attendance</div>
          <div className="mt-3 font-display text-[34px] leading-none text-ink">
            {overallPct === null ? "—" : `${overallPct}%`}
          </div>
          <div className="mt-4 text-[12.5px] leading-[1.45] text-text">
            {overallPct === null
              ? "No classes counted yet."
              : `You attended ${presentAll} of ${presentAll + absentAll} classes.`}
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-surface p-5">
          <div className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Classes · this week</div>
          <div className="mt-3 font-display text-[34px] leading-none text-ink">{held}</div>
          <div className="mt-4 text-[12.5px] text-text">
            {done} done · {Math.max(held - done, 0)} to go
          </div>
          {missedThisWeek > 0 && (
            <div className="mt-1 font-mono text-[10.5px] text-red-600">{missedThisWeek} missed</div>
          )}
        </div>
      </section>

      {/* Row 2 — streak + today */}
      <section className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col justify-between rounded-[22px] bg-navy p-5 text-white sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-gold uppercase">Your streak</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-[44px] leading-none">{stats.streak}</span>
                <span className="text-[14px] text-white/80">{stats.streak === 1 ? "week" : "weeks"} in a row</span>
              </div>
            </div>
            <span
              aria-hidden
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                stats.streak > 0 ? "bg-gold text-navy" : "bg-white/10 text-white/60"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d="M12.6 2.2c.3 2.6-.6 4.2-2 5.8-1.3 1.5-2.6 3-2.6 5.2 0 1.3.5 2.4 1.3 3.2-.1-1.9.8-3 1.9-4 1-.9 1.7-1.9 1.9-3.4 2.7 1.8 4.4 4.6 4.4 7.3A6.5 6.5 0 0 1 12 18.5a6.5 6.5 0 0 1-6.5-6.5c0-4.7 4-7 7.1-9.8Z" />
              </svg>
            </span>
          </div>
          <div>
            <p className="mt-4 max-w-[44ch] text-[14px] leading-[1.55] text-white/90">
              {streakMessage(stats.streak, missedThisWeek)}
            </p>
            <div className="mt-4 flex gap-1.5">
              {streakDots.map((filled, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${filled ? "bg-gold" : "bg-white/15"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[22px] border border-border-strong bg-surface p-5 sm:p-6">
          {todayClass ? (
            <>
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">Today&apos;s class</div>
                <div className="mt-2 font-display text-[22px] leading-[1.15] text-ink">{todayClass.subject}</div>
                <div className="mt-1.5 font-mono text-[12px] text-muted">
                  {todayClass.start_time} · {todayClass.teacher}
                </div>
              </div>
              <div className="mt-5">
                {canPunch ? (
                  <PunchButton punched={alreadyPunched} />
                ) : (
                  <span className="inline-flex h-10 items-center rounded-full bg-gold/30 px-4 text-[12.5px] font-bold text-[#8a6b12]">
                    {todayClass.status === "cancelled" ? "Cancelled this week" : "Rescheduled"}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">No class today</div>
              <div className="mt-2 font-display text-[22px] leading-[1.15] text-ink">A day to revise</div>
              {nextClass && (
                <div className="mt-1.5 text-[13px] text-text">
                  Next up: <span className="font-semibold text-ink">{nextClass.subject}</span>
                  <span className="font-mono text-[12px] text-muted">
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
      <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-bold text-ink">New classes this week</h2>
            <Link href="/student/courses" className="text-[12.5px] font-semibold text-primary hover:underline">
              All courses →
            </Link>
          </div>
          {newLessons.length === 0 ? (
            <p className="rounded-[18px] border border-dashed border-border-strong px-5 py-6 text-[13.5px] text-muted">
              Nothing new uploaded yet this week. Check back soon, in sha Allah.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {newLessons.slice(0, MAX_ITEMS).map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/student/courses/${l.course_id}?lesson=${l.position}`}
                    className="group flex items-center gap-3.5 rounded-[18px] border border-border bg-surface p-2.5 transition-colors hover:border-border-strong"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.ytimg.com/vi/${l.youtube_video_id}/mqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-[88px] shrink-0 rounded-[12px] bg-surface-2 object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-ink group-hover:underline">
                        {l.title}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-muted">
                        {courseTitle.get(l.course_id)} · {relativeDay(l.created_at, todayIso)}
                      </span>
                    </span>
                    <span aria-hidden className="pr-2 text-muted group-hover:text-ink">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {newLessons.length > MAX_ITEMS && (
            <Link href="/student/courses" className="mt-2 inline-block text-[12.5px] font-semibold text-muted hover:text-ink">
              +{newLessons.length - MAX_ITEMS} more this week
            </Link>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-bold text-ink">Tasks this week</h2>
            <Link href="/student/tasks" className="text-[12.5px] font-semibold text-primary hover:underline">
              All tasks →
            </Link>
          </div>
          {weekTasks.length === 0 ? (
            <p className="rounded-[18px] border border-dashed border-border-strong px-5 py-6 text-[13.5px] text-muted">
              You&apos;re all caught up — no tasks due this week.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {weekTasks.slice(0, MAX_ITEMS).map((t) => {
                const due = dueMetaFor(t.due, now);
                return (
                  <li key={t.key}>
                    <Link
                      href="/student/tasks"
                      className="group flex items-center gap-3.5 rounded-[18px] border border-border bg-surface px-4 py-3.5 transition-colors hover:border-border-strong"
                    >
                      <span
                        aria-hidden
                        className="h-8 w-1 shrink-0 rounded-full"
                        style={{ background: colorForSubject(t.subject ?? t.title) }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink group-hover:underline">
                          {t.title}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[11px] text-muted">
                          {t.subject ?? "Personal"}
                        </span>
                      </span>
                      {due && (
                        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${due.badgeClass}`}>
                          {due.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {weekTasks.length > MAX_ITEMS && (
            <Link href="/student/tasks" className="mt-2 inline-block text-[12.5px] font-semibold text-muted hover:text-ink">
              +{weekTasks.length - MAX_ITEMS} more
            </Link>
          )}
        </div>
      </section>

      <Divider label="For the seeker of knowledge" />

      <DailyReflection items={reflections} />
    </div>
  );
}
