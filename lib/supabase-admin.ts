import { createClient } from "@supabase/supabase-js";

// Uses the service role key, which bypasses row-level security entirely.
// Only ever import this from server components / route handlers under app/admin
// or app/api/admin — never expose it to client code.
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
