// Browser-side driver for the lecture-notes pipeline. One click on "Generate
// notes" runs this loop, which calls one short API route per step so no single
// request comes near the serverless time limit:
//
//   0. read video length   (YouTube IFrame player, in this browser)
//   1. POST …/start        → how many 20-minute clips, which are already done
//   2. POST …/transcribe   → once per remaining clip (Gemini), with retries
//   3. POST …/compose      → OpenAI writes the notes, saved as a draft
//
// Progress lives in the database, so if the tab is closed mid-run the admin
// can click "Resume" and it carries on from the next untranscribed clip.

import { getYouTubeDuration } from "@/lib/youtube-iframe";
import type { CourseLessonRow, LessonNoteRow } from "@/lib/types";

export type PipelineProgress =
  | { phase: "duration" }
  | { phase: "transcribing"; done: number; total: number; waitingSeconds?: number }
  | { phase: "composing" };

// Waits between attempts when Gemini is busy / rate-limited or a request times
// out. Gemini's free tier allows ~4 requests a minute and 20 a day, and failed
// attempts may count, so there are few retries and they are well spaced (when
// Gemini says how long to wait, that is honoured if it is longer).
const RETRY_DELAYS_SECONDS = [15, 45, 90];

// Minimum gap between the starts of two Gemini requests, to stay under the
// per-minute limit.
const MIN_REQUEST_GAP_MS = 15_000;

class StepError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
  }
}

export interface PipelineDeps {
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

async function postStep<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new StepError("Network error", true);
  }
  // A platform timeout (504) comes back as an HTML page, not our JSON.
  const json = (await res.json().catch(() => null)) as
    | ({ ok: boolean; error?: string; retryable?: boolean; retryAfterSeconds?: number } & T)
    | null;
  if (!json) throw new StepError(`Request failed (${res.status})`, res.status >= 502);
  if (!res.ok || !json.ok) {
    throw new StepError(json.error ?? `Request failed (${res.status})`, json.retryable === true, json.retryAfterSeconds);
  }
  return json;
}

async function withRetries<T>(
  run: () => Promise<T>,
  onWait: (seconds: number) => void,
  sleep: (ms: number) => Promise<void>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run();
    } catch (err) {
      const base = RETRY_DELAYS_SECONDS[attempt];
      if (!(err instanceof StepError) || !err.retryable || base === undefined) throw err;
      for (let s = Math.max(base, err.retryAfterSeconds ?? 0); s > 0; s--) {
        onWait(s);
        await sleep(1000);
      }
    }
  }
}

export async function runNotesPipeline(
  lesson: Pick<CourseLessonRow, "id" | "youtube_video_id" | "duration_seconds">,
  { restart, onProgress }: { restart: boolean; onProgress: (p: PipelineProgress) => void },
  deps: PipelineDeps = {},
): Promise<{ note: LessonNoteRow; durationSeconds: number }> {
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const now = deps.now ?? Date.now;
  const base = `/api/admin/lesson-notes/${lesson.id}`;

  // 0. Video length — only needed the first time; the server keeps it after.
  let durationSeconds: number | undefined;
  if (!lesson.duration_seconds) {
    onProgress({ phase: "duration" });
    durationSeconds = await getYouTubeDuration(lesson.youtube_video_id);
  }

  // 1. Start (or resume).
  const start = await postStep<{ segmentsTotal: number; doneSegments: number[]; durationSeconds: number }>(
    `${base}/start`,
    { durationSeconds, restart },
  );
  const { segmentsTotal, doneSegments } = start;

  // 2. Transcribe each remaining clip, in order.
  const done = new Set(doneSegments);
  let lastRequestAt = -Infinity;
  onProgress({ phase: "transcribing", done: done.size, total: segmentsTotal });
  for (let segment = 0; segment < segmentsTotal; segment++) {
    if (done.has(segment)) continue;
    await withRetries(
      async () => {
        const wait = lastRequestAt + MIN_REQUEST_GAP_MS - now();
        if (wait > 0) await sleep(wait);
        lastRequestAt = now();
        return postStep(`${base}/transcribe`, { segment });
      },
      (waitingSeconds) => onProgress({ phase: "transcribing", done: done.size, total: segmentsTotal, waitingSeconds }),
      sleep,
    );
    done.add(segment);
    onProgress({ phase: "transcribing", done: done.size, total: segmentsTotal });
  }

  // 3. Write the notes.
  onProgress({ phase: "composing" });
  const { note } = await withRetries(
    () => postStep<{ note: LessonNoteRow }>(`${base}/compose`, {}),
    () => onProgress({ phase: "composing" }),
    sleep,
  );
  return { note, durationSeconds: start.durationSeconds };
}
