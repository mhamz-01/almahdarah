import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { isIsoDate, validateCancellationPayload } from "@/lib/admin/schedule-validation";
import { emailConfigured, sendMany, siteUrl } from "@/lib/email/send";
import { renderClassCancelled } from "@/lib/email/templates";
import { addDaysIso, slotOn } from "@/lib/students";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ClassCancellationRow, ClassScheduleRow, StudentRow } from "@/lib/types";

// How far back / ahead a date can be cancelled from the admin schedule.
const PAST_DAYS = 35;
const FUTURE_DAYS = 120;

async function authorized() {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSession(session);
}

// Cancels one date's class. Students' streaks leave it out of that week's target.
export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const validated = validateCancellationPayload(await request.json().catch(() => null));
  if (!validated.ok) return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  const { class_date, reason, note, notify } = validated.value;

  const today = new Date().toISOString().slice(0, 10);
  if (class_date < addDaysIso(today, -PAST_DAYS) || class_date > addDaysIso(today, FUTURE_DAYS)) {
    return NextResponse.json({ ok: false, error: "That date is too far away to change" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: scheduleRows } = await supabase.from("class_schedule").select("*");
  const slot = slotOn(((scheduleRows as ClassScheduleRow[] | null) ?? []).map((s) => ({ ...s, active_from: s.active_from ?? "2000-01-01" })), class_date);
  if (!slot) return NextResponse.json({ ok: false, error: "There's no class on that day" }, { status: 400 });

  const { data, error } = await supabase
    .from("class_cancellations")
    .upsert({ class_date, schedule_id: slot.id, reason, note }, { onConflict: "class_date" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  let emailed = 0;
  if (notify && emailConfigured() && class_date >= today) {
    const { data: students } = await supabase
      .from("students")
      .select("id, created_at, name, email, last_login_at")
      .not("email", "is", null);
    const recipients = ((students ?? []) as (Pick<StudentRow, "id" | "created_at" | "name" | "email"> & { last_login_at: string | null })[])
      .filter((s) => s.email?.trim() && s.last_login_at && s.created_at.slice(0, 10) <= class_date);
    const results = await sendMany(
      recipients.map((s) => ({
        to: s.email!.trim(),
        ...renderClassCancelled(
          { firstName: s.name.trim().split(/\s+/)[0] || "there", subject: slot.subject, classDate: class_date, reason, note },
          siteUrl(),
        ),
      })),
    );
    emailed = results.filter((r) => r.ok).length;
  }

  return NextResponse.json({ ok: true, cancellation: data as ClassCancellationRow, emailed });
}

// Restores a cancelled date.
export async function DELETE(request: Request) {
  if (!(await authorized())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { date?: unknown } | null;
  if (!isIsoDate(body?.date)) return NextResponse.json({ ok: false, error: "Choose a valid date" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("class_cancellations").delete().eq("class_date", body.date);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
