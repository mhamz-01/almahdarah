import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { computeStudentStats } from "@/lib/students";
import { PunchButton } from "@/components/student/punch-button";
import type { AttendanceRow, ClassScheduleRow, StudentAuthRow, Weekday } from "@/lib/types";

export const dynamic = "force-dynamic";

const WEEKDAY_BY_UTC_INDEX: (Weekday | null)[] = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", null];

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function StudentPunchPage() {
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
  const now = new Date();
  const stats = computeStudentStats(student, attendance, now);
  const thisWeekStart = stats.weeks[0]?.startDate ?? now.toISOString().slice(0, 10);
  const todayIso = now.toISOString().slice(0, 10);
  const todayDay = WEEKDAY_BY_UTC_INDEX[now.getUTCDay()];
  const todayClass = todayDay ? (schedule.find((s) => s.day === todayDay) ?? null) : null;
  const alreadyPunched = attendance.some((a) => a.class_date === todayIso && a.status === "present");
  const canPunch = !!todayClass && todayClass.status === "scheduled";

  const todayLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const week = schedule.map((slot, i) => {
    const cell = stats.weeks[0]?.cells[i];
    const classDate = addDaysIso(thisWeekStart, i);
    const isToday = classDate === todayIso;
    const isFuture = classDate > todayIso;

    let status: "cancelled" | "present" | "missed" | "today" | "upcoming" | "unmarked";
    if (slot.status !== "scheduled") status = "cancelled";
    else if (cell?.status === "present") status = "present";
    else if (cell?.status === "absent") status = "missed";
    else if (isToday) status = "today";
    else if (isFuture) status = "upcoming";
    else status = "unmarked";

    const badge = {
      cancelled: { label: "Cancelled", cls: "bg-gold/30 text-[#8a6b12]" },
      today: { label: "Today", cls: "bg-gold/34 text-[#8a6b12]" },
      present: { label: "Present", cls: "bg-green/16 text-green" },
      missed: { label: "Missed", cls: "bg-red-600/14 text-red-600" },
      upcoming: { label: "Upcoming", cls: "bg-surface-2 text-muted" },
      unmarked: { label: "Not marked", cls: "bg-surface-2 text-muted" },
    }[status];

    const dateLabel = new Date(`${classDate}T00:00:00Z`).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

    return {
      key: slot.id,
      day: slot.day,
      date: dateLabel,
      subject: slot.subject,
      time: slot.start_time,
      teacher: slot.teacher,
      badgeLabel: badge.label,
      badgeClass: badge.cls,
      rowBg: isToday ? "bg-surface" : "bg-bg",
    };
  });

  return (
    <div className="max-w-[760px]">
      <span className="font-mono text-[11px] tracking-[0.26em] text-muted uppercase">{todayLabel}</span>
      <h1 className="mt-3.5 mb-2.5 font-display text-[clamp(28px,3.6vw,42px)] leading-none tracking-[-0.01em] text-ink uppercase">
        Punch today&apos;s attendance
      </h1>
      <p className="mb-[34px] text-[15px] leading-[1.65] text-text">
        Mark yourself present while the class is on — your teacher can see it update in real time.
      </p>

      <div className="rounded-[3px] border border-border-strong bg-surface p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10.5px] font-bold tracking-[0.14em] text-primary uppercase">
              {todayClass ? "Today's class" : "No class today"}
            </span>
            <div className="mt-2.5 font-display text-[24px] leading-[1.1] text-ink uppercase">
              {todayClass ? todayClass.subject : "Enjoy your day off"}
            </div>
            {todayClass && (
              <div className="mt-2 font-mono text-[12.5px] text-muted">
                {todayClass.start_time} · {todayClass.teacher}
              </div>
            )}
          </div>
          {canPunch ? (
            <PunchButton punched={alreadyPunched} />
          ) : (
            todayClass && (
              <span className="inline-flex h-11 items-center rounded-full bg-gold/30 px-5 text-[13px] font-bold text-[#8a6b12]">
                {todayClass.status === "cancelled" ? "Cancelled this week" : "Rescheduled"}
              </span>
            )
          )}
        </div>
        <div className="mt-[22px] border-t border-border pt-[18px] text-[13px] text-muted">
          {canPunch
            ? "Marking present is instant — undo it any time today if you tapped it by mistake."
            : todayClass
              ? todayClass.note || "This class isn't running as scheduled today."
              : "There's no class scheduled for today — check back on your next class day."}
        </div>
      </div>

      <div className="mt-11">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="m-0 font-display text-[16px] tracking-[0.02em] text-ink uppercase">This week</h2>
          <span className="font-mono text-[11px] text-muted">Mon — Fri</span>
        </div>
        <div className="overflow-hidden rounded-[3px] border border-border">
          {week.map((d) => (
            <div
              key={d.key}
              className={`grid grid-cols-[112px_1fr_auto] items-center gap-4 border-b border-border px-5 py-[18px] last:border-b-0 ${d.rowBg}`}
            >
              <div className="flex flex-col leading-[1.3]">
                <span className="text-[13.5px] font-bold text-ink">{d.day}</span>
                <span className="font-mono text-[11px] text-muted">{d.date}</span>
              </div>
              <div className="min-w-0">
                <div className="text-[14.5px] font-semibold text-ink">{d.subject}</div>
                <div className="mt-[3px] font-mono text-[11px] text-muted">
                  {d.time} · {d.teacher}
                </div>
              </div>
              <span
                className={`w-fit justify-self-end rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.08em] uppercase ${d.badgeClass}`}
              >
                {d.badgeLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
