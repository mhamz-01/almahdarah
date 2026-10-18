// Server side of direct-to-Supabase uploads.
//
// Files go browser -> Supabase Storage, so they never pass through our API routes
// (hosts like Vercel reject request bodies over ~4.5MB before a route can run).
//
//   1. createUploadTarget()  hands the browser a one-time signed upload slot
//                            after checking the session (in the route), size and type.
//   2. The browser uploads to that slot with uploadToSignedUrl().
//   3. verifyUploads()       runs when the task is saved: it checks the claimed
//                            objects exist, are inside the caller's folder, and
//                            still pass the size/type rules, then builds public URLs.

import { TASK_ATTACHMENT_MAX_BYTES, validateTaskAttachment, type AttachmentMeta } from "@/lib/admin/task-validation";
import type { createSupabaseAdminClient } from "@/lib/supabase-admin";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

export const ADMIN_TASK_BUCKET = "task-attachments";
// New direct uploads live under this folder; saving a task only accepts paths from here.
export const ADMIN_UPLOAD_PREFIX = "uploads/";

export interface UploadTarget {
  path: string;
  token: string;
}

export interface ClaimedUpload {
  path: string;
  name: string;
}

export interface VerifiedUpload {
  url: string;
  name: string;
  path: string;
}

const SAFE_PATH = /^[A-Za-z0-9._\-/]{1,300}$/;
const NAME_MAX_LENGTH = 255;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

export function parseFileMeta(value: unknown): AttachmentMeta | null {
  if (!value || typeof value !== "object") return null;
  const { name, size, type } = value as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim() || name.length > NAME_MAX_LENGTH) return null;
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) return null;
  return { name, size, type: typeof type === "string" ? type : "" };
}

/** `prefix` must be "" or end with "/" — e.g. `${studentId}/`. */
export async function createUploadTarget(
  supabase: Admin,
  bucket: string,
  prefix: string,
  meta: AttachmentMeta,
): Promise<{ ok: true; target: UploadTarget } | { ok: false; error: string }> {
  const invalid = validateTaskAttachment(meta);
  if (invalid) return { ok: false, error: invalid };

  const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitizeFileName(meta.name)}`;
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? "Couldn't prepare the upload" };
  return { ok: true, target: { path: data.path, token: data.token } };
}

/** Parses a JSON string of `{path, name}` (one) or `[{path, name}, …]` (many) from a form field. */
export function parseClaimed(raw: unknown): ClaimedUpload[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const { path, name } = item as Record<string, unknown>;
      if (typeof path !== "string" || typeof name !== "string") return [];
      return [{ path, name: name.slice(0, NAME_MAX_LENGTH) }];
    });
  } catch {
    return [];
  }
}

function insideFolder(path: string, prefix: string) {
  return SAFE_PATH.test(path) && !path.includes("..") && path.startsWith(prefix);
}

/** Deletes claimed objects, but only ones inside `prefix`, so a forged path can't remove someone else's file. */
export async function discardClaimed(supabase: Admin, bucket: string, claimed: ClaimedUpload[], prefix: string) {
  const paths = claimed.map((c) => c.path).filter((p) => insideFolder(p, prefix));
  if (paths.length) await supabase.storage.from(bucket).remove(paths);
}

export async function verifyUploads(
  supabase: Admin,
  bucket: string,
  claimed: ClaimedUpload[],
  prefix: string,
): Promise<{ ok: true; items: VerifiedUpload[] } | { ok: false; error: string }> {
  const items: VerifiedUpload[] = [];
  for (const c of claimed) {
    let error: string | null = null;
    if (!insideFolder(c.path, prefix)) {
      error = "Invalid upload";
    } else {
      const { data: info } = await supabase.storage.from(bucket).info(c.path);
      if (!info) error = "An uploaded file couldn't be found. Please attach it again.";
      else if ((info.size ?? 0) > TASK_ATTACHMENT_MAX_BYTES) error = "Attachment must be 15MB or smaller";
      else error = validateTaskAttachment({ name: c.name, size: info.size ?? 1, type: info.contentType ?? "" });
    }
    if (error) {
      await discardClaimed(supabase, bucket, claimed, prefix);
      return { ok: false, error };
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(c.path);
    items.push({ url: data.publicUrl, name: c.name, path: c.path });
  }
  return { ok: true, items };
}
