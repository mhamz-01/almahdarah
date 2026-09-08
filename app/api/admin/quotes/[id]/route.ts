import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { validateQuotePayload } from "@/lib/admin/quote-validation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { QuoteInsert, QuoteRow } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  // A lightweight publish/unpublish toggle skips full-field validation.
  const isPublishToggle =
    typeof body === "object" && body !== null && Object.keys(body).length === 1 && "published" in body;

  let updatePayload: QuoteInsert | { published: boolean };
  if (isPublishToggle) {
    if (typeof body.published !== "boolean") {
      return NextResponse.json({ ok: false, error: "Invalid published flag" }, { status: 400 });
    }
    updatePayload = { published: body.published };
  } else {
    const validated = validateQuotePayload(body);
    if (!validated.ok) {
      return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
    }
    updatePayload = validated.value;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quotes")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, quote: data as QuoteRow });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("quotes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
