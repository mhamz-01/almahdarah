import { createClient } from "@supabase/supabase-js";
import { toQuoteEntry } from "@/lib/quotes";
import type { QuoteRow, ReviewRow } from "@/lib/types";

export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

export type LeadSource = "demo_booking" | "free_course";

export interface LeadInsert {
  source: LeadSource;
  name: string;
  phone?: string | null;
  email?: string | null;
  details: Record<string, unknown>;
}

export async function insertLead(lead: LeadInsert) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("leads").insert(lead);
  if (error) throw error;
}

export type ReviewerType = "parent" | "student";

export interface ReviewInsert {
  reviewer_type: ReviewerType;
  name: string;
  country: string;
  city: string;
  rating: number;
  review_text: string;
}

export async function insertReview(review: ReviewInsert) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("reviews").insert(review);
  if (error) throw error;
}

// Uses the anon key, so row-level security only ever returns approved reviews here.
export async function getPublishedReviews() {
  const supabase = createSupabaseServerClient();
  return supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<ReviewRow[]>();
}

// Uses the anon key, so row-level security only ever returns published quotes here.
export async function getPublishedQuotes() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .returns<QuoteRow[]>();

  return { data: data ? data.map(toQuoteEntry) : null, error };
}
