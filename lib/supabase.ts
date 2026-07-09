import { createClient } from "@supabase/supabase-js";

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
