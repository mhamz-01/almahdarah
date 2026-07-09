import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { LeadRow, ReviewRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createSupabaseAdminClient();

  const [leadsRes, reviewsRes] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(500),
  ]);

  return (
    <AdminDashboard
      leads={(leadsRes.data as LeadRow[] | null) ?? []}
      leadsError={leadsRes.error?.message ?? null}
      reviews={(reviewsRes.data as ReviewRow[] | null) ?? []}
      reviewsError={reviewsRes.error?.message ?? null}
    />
  );
}
