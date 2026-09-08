import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { computeStudentStats } from "@/lib/students";
import { StudentPortalShell } from "@/components/student/student-portal-shell";
import type { AttendanceRow, ClassScheduleRow, StudentAuthRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const [studentRes, attendanceRes, scheduleRes, unreadRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase
      .from("attendance")
      .select("*")
      .eq("student_id", session.studentId)
      .order("class_date", { ascending: false })
      .limit(200),
    supabase.from("class_schedule").select("*").order("sort_order", { ascending: true }),
    supabase.from("student_notes").select("id", { count: "exact", head: true }).eq("student_id", session.studentId).eq("read", false),
  ]);

  const student = studentRes.data as StudentAuthRow | null;
  if (!student) redirect("/student/login");

  const attendance = (attendanceRes.data as AttendanceRow[] | null) ?? [];
  const schedule = (scheduleRes.data as ClassScheduleRow[] | null) ?? [];
  const stats = computeStudentStats(student, attendance, new Date());
  const unreadCount = unreadRes.count ?? 0;

  const thisWeek = stats.weeks[0]?.cells ?? [];
  const weekMini = schedule.map((slot, i) => {
    const cellStatus = thisWeek[i]?.status;
    const cancelled = slot.status !== "scheduled";
    const label = cancelled ? "Cancelled" : cellStatus === "present" ? "Present" : cellStatus === "absent" ? "Missed" : "—";
    const colorClass = cancelled ? "text-[#8a6b12]" : cellStatus === "present" ? "text-green" : cellStatus === "absent" ? "text-red-600" : "text-muted";
    return { key: slot.id, subject: `${slot.day.slice(0, 3)} · ${slot.subject}`, mark: label, colorClass };
  });

  const thisWeekMissed = thisWeek.filter((c) => c.status === "absent").length;
  const streakNote =
    thisWeekMissed > 0 ? "Streak broken this week — start again." : `Sit every class this week to reach ${stats.streak + 1}.`;

  return (
    <StudentPortalShell
      student={{ name: student.name, username: student.username, level: student.level, avatarColor: student.avatar_color }}
      streak={stats.streak}
      streakNote={streakNote}
      weekMini={weekMini}
      unreadCount={unreadCount}
    >
      {children}
    </StudentPortalShell>
  );
}
