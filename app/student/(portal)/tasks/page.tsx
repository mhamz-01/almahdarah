import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { TasksExplorer } from "@/components/student/tasks-explorer";
import type { BoardCardRow, StudentTaskRow, TaskRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentTasksPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const [assigned, personal, board] = await Promise.all([
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase
      .from("student_tasks")
      .select("*")
      .eq("student_id", session.studentId)
      .order("created_at", { ascending: false }),
    supabase.from("board_cards").select("*").eq("student_id", session.studentId),
  ]);

  return (
    <TasksExplorer
      tasks={(assigned.data as TaskRow[] | null) ?? []}
      personalTasks={(personal.data as StudentTaskRow[] | null) ?? []}
      loadError={assigned.error?.message ?? null}
      boardCards={(board.data as BoardCardRow[] | null) ?? []}
      personalLoadError={personal.error?.message ?? null}
      boardLoadError={board.error?.message ?? null}
    />
  );
}
