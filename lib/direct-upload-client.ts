// Browser side of direct-to-Supabase uploads (see lib/upload-targets.ts).

import { createClient } from "@supabase/supabase-js";
import { readApiJson } from "@/lib/read-api-json";

const TYPE_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  txt: "text/plain",
  zip: "application/zip",
};

// Some browsers report no type for a PDF; storing it as a generic download would stop it opening inline.
function contentTypeFor(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  return TYPE_BY_EXTENSION[ext] ?? "application/octet-stream";
}

export interface UploadedFile {
  path: string;
  name: string;
}

/**
 * Uploads files straight to Supabase Storage and returns their paths.
 * `endpoint` is our route that checks the session and returns signed upload slots.
 */
export async function uploadFilesDirect(endpoint: string, bucket: string, files: File[]): Promise<UploadedFile[]> {
  if (!files.length) return [];

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: files.map((f) => ({ name: f.name, size: f.size, type: contentTypeFor(f) })) }),
  });
  const json = await readApiJson<{ ok: boolean; targets?: { path: string; token: string }[]; error?: string }>(res);
  if (!res.ok || !json.ok || !json.targets || json.targets.length !== files.length) {
    throw new Error(json.error ?? "Couldn't start the upload");
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const uploaded: UploadedFile[] = [];
  for (const [i, file] of files.entries()) {
    const { path, token } = json.targets[i];
    const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file, { contentType: contentTypeFor(file) });
    if (error) throw new Error(`Couldn't upload "${file.name}": ${error.message}`);
    uploaded.push({ path, name: file.name });
  }
  return uploaded;
}
