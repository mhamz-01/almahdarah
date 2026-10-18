import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { ADMIN_TASK_BUCKET, ADMIN_UPLOAD_PREFIX, createUploadTarget, parseFileMeta } from "@/lib/upload-targets";

// Returns a signed upload slot so the browser can send the file straight to Supabase Storage.
export async function POST(request: Request) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { files?: unknown } | null;
  const metas = Array.isArray(body?.files) ? body.files.map(parseFileMeta) : [];
  if (metas.length !== 1 || !metas[0]) {
    return NextResponse.json({ ok: false, error: "Invalid upload request" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const result = await createUploadTarget(supabase, ADMIN_TASK_BUCKET, ADMIN_UPLOAD_PREFIX, metas[0]);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, targets: [result.target] });
}
