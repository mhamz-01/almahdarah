import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { EmailReminders } from "@/components/student/email-reminders";
import type { StudentEmailPrefsRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentRemindersPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const [studentRes, prefsRes] = await Promise.all([
    supabase.from("students").select("email").eq("id", session.studentId).maybeSingle(),
    supabase.from("student_email_prefs").select("*").eq("student_id", session.studentId).maybeSingle(),
  ]);
  if (!studentRes.data) redirect("/student/login");

  const prefs = prefsRes.data as StudentEmailPrefsRow | null;

  return (
    <div className="max-w-[760px]">
      <span className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Settings</span>
      <h1 className="mt-2.5 font-display text-[clamp(26px,3.4vw,38px)] leading-[1.05] tracking-[-0.01em] text-ink">Email reminders</h1>
      <p className="mt-2 text-[14.5px] text-text">Choose which emails you get. Times are Pakistan time.</p>

      <EmailReminders
        initialEmail={(studentRes.data as { email: string | null }).email ?? ""}
        initialDigest={prefs?.weekly_digest ?? true}
        initialReminder={prefs?.plan_reminder ?? false}
        initialDays={prefs?.reminder_days ?? [1, 2, 3, 4, 5]}
      />
    </div>
  );
}
