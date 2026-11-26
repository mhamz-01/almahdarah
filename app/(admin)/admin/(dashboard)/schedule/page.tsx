import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { ScheduleAdminPanel } from "@/components/admin/schedule/schedule-admin-panel";
import { loadAdminSchedule } from "@/lib/admin/schedule-data";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const supabase = createSupabaseAdminClient();
  const data = await loadAdminSchedule(supabase, new Date());

  return (
    <ScheduleAdminPanel
      schedule={data.schedule}
      loadError={data.error}
      courses={data.courses}
      guessedCourse={data.guessedCourse}
      days={data.days}
      mondays={data.mondays}
      currentMonday={data.currentMonday}
      todayIso={data.todayIso}
      lessonsByCourse={data.lessonsByCourse}
    />
  );
}
