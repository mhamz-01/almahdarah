import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { validateScheduleCreatePayload } from "@/lib/admin/schedule-validation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ClassScheduleRow } from "@/lib/types";

// Creates a new weekday slot. class_schedule has a unique index on `day`
// (one class per weekday), so adding a second class on a day that already
// has one fails with a duplicate-key error — the admin edits the existing
// row instead.
export async function POST(request: Request) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const validated = validateScheduleCreatePayload(await request.json());
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("class_schedule")
    .insert({ ...validated.value, published_at: new Date().toISOString() })
    .select("*")
    .single();

  if (error) {
    const isDuplicate = error.code === "23505";
    return NextResponse.json(
      {
        ok: false,
        error: isDuplicate ? "There's already a class on that day — edit it instead of adding another" : error.message,
      },
      { status: isDuplicate ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true, slot: data as ClassScheduleRow });
}
