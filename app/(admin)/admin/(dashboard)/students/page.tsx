import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { StudentsAdminView } from "@/components/admin/students/students-admin-view";
import { decryptSecret } from "@/lib/secret-box";
import { computeStatsForStudents } from "@/lib/class-calendar";
import { computeStudentStats } from "@/lib/students";
import type { StudentAuthRow, StudentRequestRow, StudentRequestView, StudentRow, StudentWithStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const supabase = createSupabaseAdminClient();
  const [studentsRes, requestsRes] = await Promise.all([
    supabase.from("students").select("*").order("name", { ascending: true }),
    supabase.from("student_requests").select("*").order("created_at", { ascending: false }).limit(200),
  ]);

  const students = (studentsRes.data as StudentAuthRow[] | null) ?? [];
  const requests = (requestsRes.data as StudentRequestRow[] | null) ?? [];
  const now = new Date();
  // Only the public student fields go into the stats (they are spread into props sent to the browser).
  const publicRows: StudentRow[] = students.map((s) => ({
    id: s.id,
    created_at: s.created_at,
    name: s.name,
    username: s.username,
    avatar_color: s.avatar_color,
    email: s.email,
    phone: s.phone,
  }));
  let stats = new Map<number, StudentWithStats>();
  let statsError: string | null = null;
  try {
    stats = (await computeStatsForStudents(supabase, publicRows, now)).stats;
  } catch (e) {
    statsError = e instanceof Error ? e.message : "Couldn't load attendance";
  }

  // password_hash never leaves this server component. The admin-viewable
  // password is decrypted here (this page is behind the admin session) and
  // passed down as plain text only for the admin panel to display.
  const studentsWithStats = students.map(({ password_hash, password_enc, last_login_at, ...student }) => ({
    ...(stats.get(student.id) ?? computeStudentStats(publicRows.find((r) => r.id === student.id) ?? student, [], now)),
    hasLogin: Boolean(password_hash),
    password: decryptSecret(password_enc),
    lastLoginAt: last_login_at ?? null,
  }));

  const requestViews: StudentRequestView[] = requests.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    name: r.name,
    username: r.username,
    // Only pending requests need the password shown; once reviewed it's
    // either on the student row or discarded.
    password: r.status === "pending" ? decryptSecret(r.password_enc) : null,
    email: r.email,
    phone: r.phone,
    time_at_almahdrah: r.time_at_almahdrah,
    expectations: r.expectations,
    status: r.status,
    reviewed_at: r.reviewed_at,
  }));

  return (
    <StudentsAdminView
      students={studentsWithStats}
      requests={requestViews}
      loadError={studentsRes.error?.message ?? statsError}
      requestsLoadError={requestsRes.error?.message ?? null}
    />
  );
}
