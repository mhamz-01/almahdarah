import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { TodayClassCard } from "@/components/admin/today-class-card";
import { loadAdminSchedule } from "@/lib/admin/schedule-data";
import type { LeadRow, ReviewRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createSupabaseAdminClient();

  const [leadsRes, reviewsRes, schedule] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(500),
    loadAdminSchedule(supabase, new Date(), 0, 0),
  ]);

  return (
    <>
      <TodayClassCard week={schedule.days} todayIso={schedule.todayIso} />
      <AdminDashboard
      leads={(leadsRes.data as LeadRow[] | null) ?? []}
      leadsError={leadsRes.error?.message ?? null}
      reviews={(reviewsRes.data as ReviewRow[] | null) ?? []}
      reviewsError={reviewsRes.error?.message ?? null}
      />
    </>
  );
}
