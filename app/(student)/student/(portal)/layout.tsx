import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { StudentPortalShell } from "@/components/student/student-portal-shell";
import type { StudentAuthRow, StudentEmailPrefsRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const [studentRes, unreadRes, requestRes, prefsRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase.from("student_notes").select("id", { count: "exact", head: true }).eq("student_id", session.studentId).eq("read", false),
    supabase
      .from("student_requests")
      .select("time_at_almahdrah, expectations")
      .eq("student_id", session.studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("student_email_prefs").select("*").eq("student_id", session.studentId).maybeSingle(),
  ]);
  const prefs = prefsRes.data as StudentEmailPrefsRow | null;
  const request = requestRes.data as { time_at_almahdrah: string; expectations: string } | null;

  const student = studentRes.data as StudentAuthRow | null;
  if (!student) redirect("/student/login");

  return (
    <>
      {/* Marker: globals.css switches every portal font to Poppins while this is on the page. */}
      <span className="student-poppins hidden" aria-hidden />
      <StudentPortalShell
        student={{
          name: student.name,
          username: student.username,
          avatarColor: student.avatar_color,
          email: student.email,
          phone: student.phone,
          timeAtAlmahdrah: request?.time_at_almahdrah ?? null,
          expectations: request?.expectations ?? null,
          memberSince: new Date(student.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
        }}
        emailPrefs={{
          initialEmail: student.email ?? "",
          initialDigest: prefs?.weekly_digest ?? true,
          initialReminder: prefs?.plan_reminder ?? false,
          initialDays: prefs?.reminder_days ?? [1, 2, 3, 4, 5],
        }}
        unreadCount={unreadRes.count ?? 0}
      >
        {children}
      </StudentPortalShell>
    </>
  );
}
