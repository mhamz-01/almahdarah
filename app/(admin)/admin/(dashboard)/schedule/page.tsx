import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { ScheduleAdminPanel } from "@/components/admin/schedule/schedule-admin-panel";
import type { ClassScheduleRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("class_schedule")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <ScheduleAdminPanel schedule={(data as ClassScheduleRow[] | null) ?? []} loadError={error?.message ?? null} />
  );
}
