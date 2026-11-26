import { NextResponse } from "next/server";
import { runPlanReminders } from "@/lib/email/run";
import { runCatchUpReminders } from "@/lib/recordings";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily 07:00 Pakistan time: students who opted in get that day's planned tasks (only on their chosen days).
// Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Add `?dry=1` to see who WOULD be emailed
// without sending anything, and `?student=<id>` to limit a run to one student.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const student = Number(params.get("student"));
  try {
    const summary = await runPlanReminders({
      dryRun: params.get("dry") === "1",
      onlyStudentId: Number.isInteger(student) && student > 0 ? student : undefined,
    });
    // Also: "2 days left to catch up" for students with an unfinished recording (skipped on dry runs).
    let catchUp: Awaited<ReturnType<typeof runCatchUpReminders>> | { error: string } | null = null;
    if (params.get("dry") !== "1") {
      try {
        catchUp = await runCatchUpReminders();
      } catch (err) {
        catchUp = { error: err instanceof Error ? err.message : "Catch-up reminders failed" };
      }
    }
    return NextResponse.json({ ...summary, catchUp }, { status: summary.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Run failed" }, { status: 500 });
  }
}
