import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { StudentsAdminPanel } from "@/components/admin/students/students-admin-panel";
import { computeStudentStats } from "@/lib/students";
import type { AttendanceRow, StudentAuthRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const supabase = createSupabaseAdminClient();
  const [studentsRes, attendanceRes] = await Promise.all([
    supabase.from("students").select("*").order("name", { ascending: true }),
    supabase.from("attendance").select("*").order("class_date", { ascending: false }).limit(2000),
  ]);

  const students = (studentsRes.data as StudentAuthRow[] | null) ?? [];
  const attendance = (attendanceRes.data as AttendanceRow[] | null) ?? [];
  const now = new Date();

  // password_hash never leaves this server component — strip it here and
  // replace it with just a boolean before the row reaches the client panel.
  const studentsWithStats = students.map(({ password_hash, last_login_at, ...student }) => ({
    ...computeStudentStats(
      student,
      attendance.filter((row) => row.student_id === student.id),
      now,
    ),
    hasLogin: Boolean(password_hash),
    lastLoginAt: last_login_at ?? null,
  }));

  return (
    <StudentsAdminPanel
      students={studentsWithStats}
      loadError={studentsRes.error?.message ?? attendanceRes.error?.message ?? null}
    />
  );
}
