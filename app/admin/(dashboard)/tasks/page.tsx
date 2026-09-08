import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { TasksAdminPanel } from "@/components/admin/tasks/tasks-admin-panel";
import type { ClassScheduleRow, TaskRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  const supabase = createSupabaseAdminClient();
  const [tasksRes, scheduleRes] = await Promise.all([
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("class_schedule").select("subject"),
  ]);

  const tasks = (tasksRes.data as TaskRow[] | null) ?? [];
  const scheduleSubjects = ((scheduleRes.data as Pick<ClassScheduleRow, "subject">[] | null) ?? []).map(
    (s) => s.subject,
  );
  const subjectSuggestions = Array.from(new Set([...scheduleSubjects, ...tasks.map((t) => t.subject)])).sort(
    (a, b) => a.localeCompare(b),
  );

  return (
    <TasksAdminPanel
      tasks={tasks}
      loadError={tasksRes.error?.message ?? null}
      subjectSuggestions={subjectSuggestions}
    />
  );
}
