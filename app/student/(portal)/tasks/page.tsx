import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { TasksExplorer } from "@/components/student/tasks-explorer";
import type { TaskRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentTasksPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });

  return <TasksExplorer tasks={(data as TaskRow[] | null) ?? []} loadError={error?.message ?? null} />;
}
