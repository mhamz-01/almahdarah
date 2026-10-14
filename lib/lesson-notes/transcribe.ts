// Server-only. Pipeline step 2: transcribe one clip of a YouTube lecture with
// Gemini, which reads public YouTube URLs directly — no download needed.
// Reads GEMINI_API_KEY; only import from route handlers under app/api/admin.

import { gzipSync } from "node:zlib";
import { GEMINI_MODEL, MAX_CHARS_PER_MINUTE } from "@/lib/lesson-notes/config";

// Thrown for failures worth retrying (rate limits, "high demand" 503s,
// timeouts, unusable output). The route turns it into `retryable: true` and the
// admin's browser waits (at least `retryAfterSeconds`, when Gemini says how
// long) and tries the same clip again.
export class RetryableError extends Error {
  constructor(
    message: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
  }
}

// Leave headroom under the route's 300s limit so we can still answer with JSON.
const REQUEST_TIMEOUT_MS = 270_000;

const PROMPT = `Transcribe all speech in this video clip verbatim, in the original language(s) it is spoken in. The lecture is mostly Urdu with Arabic quotations from the Qur'an and hadith — write Urdu in Urdu script and Arabic in Arabic script. Do not translate, summarise, correct or add anything. Do not add timestamps, speaker labels or commentary. Output only the transcript text. If the clip contains no speech, output nothing.`;

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; details?: { violations?: { quotaId?: string }[]; retryDelay?: string }[] };
}

// Gemini's 429s say how long to wait, e.g. RetryInfo { retryDelay: "33s" }.
function retryAfter(res: Response, data: GeminiResponse) {
  const fromBody = (data.error?.details ?? []).map((d) => parseFloat(d.retryDelay ?? "")).find(Number.isFinite);
  const fromHeader = parseFloat(res.headers.get("retry-after") ?? "");
  const seconds = fromBody ?? (Number.isFinite(fromHeader) ? fromHeader : undefined);
  return seconds === undefined ? undefined : Math.min(120, Math.ceil(seconds));
}

// Decide whether a Gemini answer is a complete, plausible transcript. Anything
// else must not be saved as if it were one — a truncated or looping transcript
// would silently ruin the notes — so it is retried instead.
export function checkTranscript(text: string, finishReason: string | undefined, clipSeconds: number) {
  if (finishReason !== "STOP") {
    // e.g. MAX_TOKENS (cut off), RECITATION, SAFETY, or no answer at all.
    return `Gemini returned an incomplete transcript (${finishReason ?? "empty response"})`;
  }
  if (!text) return null; // a silent clip that finished normally
  if (text.length > (clipSeconds / 60) * MAX_CHARS_PER_MINUTE) return "Gemini returned far too much text (looping)";
  if (text.length >= 1500) {
    const bytes = Buffer.byteLength(text);
    // Real speech compresses to ~40%; a model stuck repeating itself, to a few %.
    if (gzipSync(text).length / bytes < 0.12) return "Gemini's transcript is stuck repeating itself";
  }
  return null;
}

// 429s carry a QuotaFailure naming the exhausted quota, e.g.
// "GenerateRequestsPerDayPerProjectPerModel-FreeTier".
function isDailyQuota(data: GeminiResponse) {
  const quotaIds = (data.error?.details ?? []).flatMap((d) => d.violations ?? []).map((v) => v.quotaId ?? "");
  return quotaIds.some((id) => /PerDay/i.test(id)) || /per ?day|daily/i.test(data.error?.message ?? "");
}

export async function transcribeSegment(videoId: string, startSeconds: number, endSeconds: number): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Transcription isn't configured — set GEMINI_API_KEY to enable it");

  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                fileData: { fileUri: `https://www.youtube.com/watch?v=${videoId}` },
                // Only this clip is processed. The picture is irrelevant for a
                // transcript, so sample one frame every 10s — the token cost is
                // then almost entirely the audio (~32 tokens/second).
                videoMetadata: { startOffset: `${startSeconds}s`, endOffset: `${endSeconds}s`, fps: 0.1 },
              },
              { text: PROMPT },
            ],
          },
        ],
        generationConfig: {
          mediaResolution: "MEDIA_RESOLUTION_LOW",
          temperature: 0,
          thinkingConfig: { thinkingLevel: "low" },
          // A 20-minute clip is ~10k tokens; this just rules out a surprise cut-off.
          maxOutputTokens: 32768,
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new RetryableError("Transcription timed out — retrying");
  }

  const data = (await res.json().catch(() => ({}))) as GeminiResponse;
  // A per-day quota won't recover by retrying — every retry just burns another
  // request — so stop and say so. Clips done so far are kept for "Resume".
  if (res.status === 429 && isDailyQuota(data)) {
    throw new Error(
      "Gemini's daily request limit is used up. Progress is saved — click Resume after the quota resets (or enable billing on the Gemini key).",
    );
  }
  if (res.status === 429 || res.status >= 500) {
    throw new RetryableError(data.error?.message ?? `Gemini is busy (${res.status})`, retryAfter(res, data));
  }
  if (!res.ok) throw new Error(`Gemini request failed (${res.status}): ${data.error?.message ?? "unknown error"}`);

  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  const problem = checkTranscript(text, candidate?.finishReason, endSeconds - startSeconds);
  if (problem) throw new RetryableError(data.promptFeedback?.blockReason ? `${problem} — ${data.promptFeedback.blockReason}` : problem);
  return text;
}
