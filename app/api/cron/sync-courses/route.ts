import { NextResponse } from "next/server";
import { syncCoursePlaylists } from "@/lib/course-sync";
import { linkRecordings } from "@/lib/recordings";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Called nightly by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer $CRON_SECRET` when the CRON_SECRET env var is set.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncCoursePlaylists();
    // New lessons may be recordings of classes students missed: link them and email those students.
    let recordings: Awaited<ReturnType<typeof linkRecordings>> | { error: string };
    try {
      recordings = await linkRecordings();
    } catch (err) {
      recordings = { error: err instanceof Error ? err.message : "Linking recordings failed" };
    }
    return NextResponse.json({ ok: true, results, recordings });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Sync failed" }, { status: 500 });
  }
}
