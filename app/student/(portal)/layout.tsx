import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { StudentPortalShell } from "@/components/student/student-portal-shell";
import type { StudentAuthRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const [studentRes, unreadRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase.from("student_notes").select("id", { count: "exact", head: true }).eq("student_id", session.studentId).eq("read", false),
  ]);

  const student = studentRes.data as StudentAuthRow | null;
  if (!student) redirect("/student/login");

  return (
    <StudentPortalShell
      student={{ name: student.name, username: student.username, avatarColor: student.avatar_color }}
      unreadCount={unreadRes.count ?? 0}
    >
      {children}
    </StudentPortalShell>
  );
}
