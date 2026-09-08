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

export async function POST(request: Request) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const fields = Object.fromEntries(
    ["subject", "title", "description", "due_date"].map((key) => [key, form.get(key)]),
  );
  const validated = validateTaskFields(fields);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const file = form.get("file");

  let attachment: Pick<TaskInsert, "attachment_url" | "attachment_name" | "attachment_path"> = {
    attachment_url: null,
    attachment_name: null,
    attachment_path: null,
  };

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
    attachment = { attachment_url: publicUrlData.publicUrl, attachment_name: file.name, attachment_path: path };
  }

  const insertPayload: TaskInsert = { ...validated.value, ...attachment };
  const { data, error } = await supabase.from("tasks").insert(insertPayload).select("*").single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, task: data as TaskRow });
}
