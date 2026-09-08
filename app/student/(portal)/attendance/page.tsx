import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { computeStudentStats } from "@/lib/students";
import type { AttendanceRow, ClassScheduleRow, StudentAuthRow, Weekday } from "@/lib/types";

export const dynamic = "force-dynamic";

const WEEKDAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function weekLabel(index: number, startDate: string) {
  if (index === 0) return "This week";
  if (index === 1) return "Last week";
  const d = new Date(`${startDate}T00:00:00Z`);
  return `Week of ${d.getUTCDate()} ${d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}`;
}

export default async function StudentAttendancePage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const [studentRes, attendanceRes, scheduleRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase.from("attendance").select("*").eq("student_id", session.studentId).order("class_date", { ascending: false }).limit(200),
    supabase.from("class_schedule").select("*").order("sort_order", { ascending: true }),
  ]);

  const student = studentRes.data as StudentAuthRow | null;
  if (!student) redirect("/student/login");

  const attendance = (attendanceRes.data as AttendanceRow[] | null) ?? [];
  const schedule = (scheduleRes.data as ClassScheduleRow[] | null) ?? [];
  const scheduleByDay = new Map(schedule.map((s) => [s.day, s]));
  const stats = computeStudentStats(student, attendance, new Date());

  const weeksRecord = stats.weeks.map((week, weekIndex) => {
    const days = WEEKDAYS.map((day, i) => {
      const cell = week.cells[i];
      const slot = scheduleByDay.get(day);
      const cancelledThisWeek = weekIndex === 0 && slot && slot.status !== "scheduled";
      const present = !cancelledThisWeek && cell.status === "present";
      const absent = !cancelledThisWeek && cell.status === "absent";
      return {
        day: day.slice(0, 3),
        subject: slot?.subject ?? day,
        statusLabel: cancelledThisWeek ? "Cancelled" : present ? "Present" : absent ? "Missed" : "Not held yet",
        statusColorClass: cancelledThisWeek ? "text-[#8a6b12]" : present ? "text-green" : absent ? "text-red-600" : "text-muted",
        dotClass: present ? "bg-green border-green" : absent ? "bg-transparent border-red-600" : "bg-transparent border-border-strong",
        cellBg: cancelledThisWeek ? "bg-gold/10" : absent ? "bg-red-600/5" : "bg-surface",
      };
    });

    const missedList = days.filter((d) => d.statusLabel === "Missed").map((d) => `${d.day} ${d.subject}`);
    const attendedCount = days.filter((d) => d.statusLabel === "Present").length;
    const held = days.filter((d) => d.statusLabel !== "Not held yet").length;
    const clean = held > 0 && missedList.length === 0;

    return {
      key: week.range,
      label: weekLabel(weekIndex, week.startDate),
      range: week.range === "This week" ? "" : week.range,
      days,
      summary:
        held === 0
          ? "No classes held yet this week."
          : missedList.length === 0
            ? `All ${attendedCount} classes attended.`
            : `Missed: ${missedList.join(", ")}.`,
      badge: held === 0 ? "in progress" : clean ? "full week" : `${missedList.length} missed`,
      badgeClass: held === 0 ? "bg-surface-2 text-muted" : clean ? "bg-green/16 text-green" : "bg-red-600/14 text-red-600",
      borderClass: weekIndex === 0 ? "border-border-strong" : "border-border",
    };
  });

  return (
    <div className="max-w-[860px]">
      <span className="font-mono text-[11px] tracking-[0.26em] text-muted uppercase">Weekly record</span>
      <h1 className="mt-3.5 mb-2.5 font-display text-[clamp(28px,3.6vw,42px)] leading-none tracking-[-0.01em] text-ink uppercase">
        Attendance
      </h1>
      <p className="mb-[34px] text-[15px] leading-[1.65] text-text">
        Week by week — the classes you sat and the ones you missed. Nothing else is counted.
      </p>

      <div className="flex flex-col gap-3.5">
        {weeksRecord.map((week) => (
          <div key={week.key} className={`overflow-hidden rounded-[3px] border bg-surface ${week.borderClass}`}>
            <div className="flex flex-col gap-[18px] border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="font-display text-[15px] text-ink uppercase">{week.label}</span>
                  {week.range && <span className="font-mono text-[11px] text-muted">{week.range}</span>}
                </div>
                <div className="mt-[7px] text-[13px] text-text">{week.summary}</div>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded-full px-3.5 py-1.5 text-[10.5px] font-bold tracking-[0.09em] uppercase ${week.badgeClass}`}
              >
                {week.badge}
              </span>
            </div>
            <div className="flex flex-wrap gap-px bg-border">
              {week.days.map((d) => (
                <div key={d.day} className={`flex-1 basis-[150px] p-[18px] ${d.cellBg}`}>
                  <div className="font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase">{d.day}</div>
                  <div className="mt-2 text-[14px] font-bold text-ink">{d.subject}</div>
                  <div className="mt-2 flex items-center gap-[7px]">
                    <span className={`h-[9px] w-[9px] rounded-full border ${d.dotClass}`} />
                    <span className={`text-[12px] font-semibold ${d.statusColorClass}`}>{d.statusLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
