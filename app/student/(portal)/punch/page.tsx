import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { computeStudentStats } from "@/lib/students";
import { PunchButton } from "@/components/student/punch-button";
import { WeekClasses, type WeekClass, type WeekGroup } from "@/components/student/week-classes";
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

  const weekGroups: WeekGroup[] = stats.weeks.map((w, wi) => ({
    label: wi === 0 ? "This week" : w.range,
    classes: schedule.map((slot, i) => {
      const cell = w.cells[i];
      const iso = addDaysIso(w.startDate, i);
      const isToday = iso === todayIso;
      let status: WeekClass["status"];
      if (slot.status !== "scheduled") status = "cancelled";
      else if (cell?.status === "present") status = "present";
      else if (cell?.status === "absent") status = "missed";
      else if (isToday) status = "today";
      else status = iso > todayIso ? "upcoming" : "missed";
      return {
        key: `${w.startDate}-${slot.id}`,
        iso,
        day: slot.day,
        date: new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" }),
        subject: slot.subject,
        time: slot.start_time,
        teacher: slot.teacher,
        status,
        isToday,
      };
    }),
  }));

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

      <WeekClasses weeks={weekGroups} />
    </div>
  );
}
