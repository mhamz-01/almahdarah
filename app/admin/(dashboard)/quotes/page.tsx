import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { QuotesAdminPanel } from "@/components/admin/quotes/quotes-admin-panel";
import type { QuoteRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("quotes").select("*").order("id", { ascending: true });

  return (
    <QuotesAdminPanel quotes={(data as QuoteRow[] | null) ?? []} loadError={error?.message ?? null} />
  );
}
