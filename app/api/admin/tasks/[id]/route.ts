import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { validateTaskAttachment, validateTaskFields } from "@/lib/admin/task-validation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { TaskInsert, TaskRow } from "@/lib/types";

const BUCKET = "task-attachments";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const form = await request.formData();
  const fields = Object.fromEntries(
    ["subject", "title", "description", "due_date"].map((key) => [key, form.get(key)]),
  );
  const validated = validateTaskFields(fields);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("tasks")
    .select("attachment_path")
    .eq("id", id)
    .maybeSingle();

  const updatePayload: Partial<TaskInsert> = { ...validated.value };

  const file = form.get("file");
  const removeAttachment = form.get("remove_attachment") === "1";

  if (file instanceof File && file.size > 0) {
    const attachmentError = validateTaskAttachment(file);
    if (attachmentError) {
      return NextResponse.json({ ok: false, error: attachmentError }, { status: 400 });
    }
    const path = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || undefined });
    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
    }
    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    updatePayload.attachment_url = publicUrlData.publicUrl;
    updatePayload.attachment_name = file.name;
    updatePayload.attachment_path = path;
    if (existing?.attachment_path) await supabase.storage.from(BUCKET).remove([existing.attachment_path]);
  } else if (removeAttachment) {
    updatePayload.attachment_url = null;
    updatePayload.attachment_name = null;
    updatePayload.attachment_path = null;
    if (existing?.attachment_path) await supabase.storage.from(BUCKET).remove([existing.attachment_path]);
  }

  const { data, error } = await supabase.from("tasks").update(updatePayload).eq("id", id).select("*").single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, task: data as TaskRow });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase.from("tasks").select("attachment_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (existing?.attachment_path) {
    await supabase.storage.from(BUCKET).remove([existing.attachment_path]);
  }

  return NextResponse.json({ ok: true });
}
