import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { loadStudentStreakContext } from "@/lib/class-calendar";
import { addDaysIso, computeStudentStats, slotOn } from "@/lib/students";
import { PunchButton } from "@/components/student/punch-button";
import { AttendanceDay } from "@/components/student/attendance-day-action";
import type { AttendanceRow, AttendanceWeek, DayStatus, StudentAuthRow, StudentWithStats } from "@/lib/types";

export const dynamic = "force-dynamic";

function weekLabel(index: number, startDate: string) {
  if (index === 0) return "This week";
  if (index === 1) return "Last week";
  const d = new Date(`${startDate}T00:00:00Z`);
  return `Week of ${d.getUTCDate()} ${d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}`;
}

function shortDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

const DAY_STYLE: Record<DayStatus, { label: string; text: string; dot: string; bg: string }> = {
  present: { label: "Present", text: "text-green", dot: "bg-green border-green", bg: "bg-surface" },
  caught_up: { label: "Caught up (recording)", text: "text-gold-ink", dot: "bg-gold border-gold", bg: "bg-gold/10" },
  catch_up: { label: "Missed · catch up", text: "text-gold-ink", dot: "border-dashed border-[#8a6b12]", bg: "bg-gold/10" },
  absent: { label: "Missed", text: "text-red-600", dot: "border-red-600", bg: "bg-red-600/5" },
  cancelled: { label: "Cancelled · not counted", text: "text-gold-ink", dot: "bg-surface-2 border-border", bg: "bg-gold/10" },
  no_class: { label: "Day off", text: "text-muted", dot: "border-transparent", bg: "bg-bg" },
  upcoming: { label: "Not held yet", text: "text-muted", dot: "border-border-strong", bg: "bg-surface" },
  before_join: { label: "Before you joined", text: "text-muted", dot: "border-border", bg: "bg-bg" },
};

function summaryFor(week: AttendanceWeek, stats: StudentWithStats, subjectOf: (iso: string) => string): { text: string; badge: string; badgeClass: string } {
  const missed = week.cells.filter((c) => c.status === "absent");
  const caught = week.cells.filter((c) => c.status === "caught_up");
  const open = week.cells.filter((c) => c.status === "catch_up");
  const cancelled = week.cells.filter((c) => c.status === "cancelled").length;
  const name = (c: { day: string; date: string }) => `${c.day.slice(0, 3)} ${subjectOf(c.date)}`;

  if (week.target === 0) {
    return cancelled
      ? { text: "Every class was cancelled. Your streak was paused, not broken.", badge: "Paused", badgeClass: "bg-primary/12 text-primary" }
      : { text: "No classes this week.", badge: "No classes", badgeClass: "bg-surface-2 text-muted" };
  }
  if (missed.length) {
    return {
      text: `Missed: ${missed.map(name).join(", ")}.${open.length ? ` Still time to catch up on ${open.map(name).join(", ")}.` : ""}`,
      badge: `${missed.length} missed`,
      badgeClass: "bg-red-600/14 text-red-600",
    };
  }
  const parts: string[] = [];
  if (open.length) {
    const item = stats.catchUps.find((c) => c.date === open[0].date);
    parts.push(
      item?.state === "ready"
        ? `${name(open[0])}: watch the recording by ${shortDate(item.deadline)}.`
        : `${name(open[0])}: waiting for the recording.`,
    );
  }
  if (caught.length) parts.push(`Caught up on ${caught.map(name).join(", ")} from the recording.`);
  if (cancelled) parts.push(`${cancelled} cancelled.`);

  if (week.outcome === "in_progress") {
    return { text: [`${week.attended} of ${week.target} attended so far.`, ...parts].join(" "), badge: `In progress · ${week.attended}/${week.target}`, badgeClass: "bg-surface-2 text-muted" };
  }
  if (open.length) {
    return { text: parts.join(" "), badge: `Catching up · ${week.attended}/${week.target}`, badgeClass: "bg-gold/30 text-gold-ink" };
  }
  return {
    text: [`All ${week.target} ${week.target === 1 ? "class" : "classes"} attended.`, ...parts].join(" "),
    badge: caught.length ? `Caught up · ${week.attended}/${week.target}` : `Full week · ${week.attended}/${week.target}`,
    badgeClass: caught.length ? "bg-gold/30 text-gold-ink" : "bg-green/16 text-green",
  };
}

export default async function StudentAttendancePage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const [studentRes, attendanceRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase.from("attendance").select("*").eq("student_id", session.studentId).order("class_date", { ascending: false }).limit(1000),
  ]);

  const student = studentRes.data as StudentAuthRow | null;
  if (!student) redirect("/student/login");

  const attendance = (attendanceRes.data as AttendanceRow[] | null) ?? [];
  const { calendar, ctx } = await loadStudentStreakContext(supabase, student.id, student.created_at);
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const stats = computeStudentStats(student, attendance, now, ctx);
  const subjectOf = (iso: string) => slotOn(calendar.schedule, iso)?.subject ?? "";

  // Today
  const todaySlot = slotOn(calendar.schedule, todayIso);
  const todayCancel = calendar.cancellations.find((c) => c.class_date === todayIso) ?? null;
  const punchedToday = attendance.some((a) => a.class_date === todayIso && a.status === "present");
  const todayLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  // Past days can be changed for 35 days (same limit as the attendance API).
  const editableFrom = addDaysIso(todayIso, -35);

  const weeksRecord = stats.weeks.map((week, weekIndex) => {
    const summary = summaryFor(week, stats, subjectOf);
    return {
      key: week.startDate,
      label: weekLabel(weekIndex, week.startDate),
      range: week.range === "This week" ? "" : week.range,
      summary,
      borderClass: weekIndex === 0 ? "border-border-strong" : "border-border",
      days: week.cells.map((cell) => {
        const style = DAY_STYLE[cell.status];
        const item = cell.status === "catch_up" ? stats.catchUps.find((c) => c.date === cell.date) : undefined;
        const label =
          item && item.state === "ready" && item.durationSeconds && item.watchedSeconds > 0
            ? `Catching up · ${Math.min(99, Math.round((item.watchedSeconds / item.durationSeconds) * 100))}%`
            : item?.state === "waiting"
              ? "Missed · waiting for recording"
              : style.label;
        return {
          day: cell.day.slice(0, 3),
          subject: cell.status === "no_class" ? "No class" : subjectOf(cell.date) || cell.day,
          text: style.text,
          dot: style.dot,
          bg: style.bg,
          label,
          action:
            cell.date >= todayIso || cell.date < editableFrom
              ? null
              : cell.status === "absent" || cell.status === "catch_up"
                ? { date: cell.date, present: false }
                : cell.status === "present"
                  ? { date: cell.date, present: true }
                  : null,
        };
      }),
    };
  });

  return (
    <div className="max-w-[860px]">
      <span className="font-mono text-[12px] tracking-[0.1em] text-primary uppercase">Weekly record</span>
      <h1 className="mt-3.5 mb-2.5 font-display text-[clamp(28px,3.6vw,42px)] leading-none tracking-[-0.01em] text-ink uppercase">
        Attendance
      </h1>
      <p className="mb-7 text-[15px] leading-[1.65] text-text">
        Mark today’s class here. Forgot to mark a day you attended? Tap that day (the ones with a pencil). Cancelled classes and days off never count.
      </p>

      <section aria-label="Today's class" className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-border-strong bg-surface px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <div className="font-mono text-[11px] tracking-[0.1em] text-primary uppercase">Today · {todayLabel}</div>
          <div className="mt-1.5 text-[18px] font-semibold text-ink">{todaySlot ? todaySlot.subject : "No class today"}</div>
          <div className="mt-0.5 text-[13px] text-muted">
            {!todaySlot
              ? "Enjoy your day. Your next class shows up here on the day."
              : todayCancel
                ? `Cancelled (${todayCancel.reason.toLowerCase()}). It doesn’t count, your streak is safe.`
                : `${todaySlot.start_time} · ${todaySlot.teacher}`}
          </div>
        </div>
        {todaySlot && !todayCancel && <PunchButton punched={punchedToday} />}
      </section>

      <div className="flex flex-col gap-3.5">
        {weeksRecord.map((week) => (
          <div key={week.key} className={`overflow-hidden rounded-[14px] border bg-surface ${week.borderClass}`}>
            <div className="flex flex-col gap-[18px] border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="font-display text-[15px] text-ink uppercase">{week.label}</span>
                  {week.range && <span className="font-mono text-[11px] text-muted">{week.range}</span>}
                </div>
                <div className="mt-[7px] text-[13px] text-text">{week.summary.text}</div>
              </div>
              <span className={`inline-flex w-fit shrink-0 items-center rounded-full px-3.5 py-1.5 text-[10.5px] font-bold tracking-[0.09em] uppercase ${week.summary.badgeClass}`}>
                {week.summary.badge}
              </span>
            </div>
            <div className="flex flex-wrap gap-px bg-border">
              {week.days.map((d) => (
                <AttendanceDay key={d.day} bg={d.bg} action={d.action}>
                  <div className="font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase">{d.day}</div>
                  <div className="mt-2 text-[14px] font-bold text-ink">{d.subject}</div>
                  <div className="mt-2 flex items-center gap-[7px]">
                    <span className={`h-[9px] w-[9px] rounded-full border ${d.dot}`} />
                    <span className={`text-[12px] font-semibold ${d.text}`}>{d.label}</span>
                  </div>
                </AttendanceDay>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
