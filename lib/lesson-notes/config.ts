// Settings for the lecture-notes pipeline (see supabase/migrations/0021_create_lesson_notes.sql).

// Each transcription request covers one clip of this length. Gemini's free tier
// allows only 20 requests a day, so clips are long: a 60-minute lecture takes 3
// requests. That needs the transcribe route's 300s limit (Vercel Fluid compute);
// without it, set LECTURE_NOTES_SEGMENT_MINUTES=5 to fit the old 60s limit.
const segmentMinutes = Number(process.env.LECTURE_NOTES_SEGMENT_MINUTES);
export const SEGMENT_SECONDS =
  Number.isFinite(segmentMinutes) && segmentMinutes >= 1 && segmentMinutes <= 30 ? Math.round(segmentMinutes * 60) : 1200;

// Clip results that can't be a real transcript. Urdu lecture speech measured
// ~900 characters per minute; a model stuck repeating itself produces far more.
export const MAX_CHARS_PER_MINUTE = 2500;

// Refuse anything longer (a mis-read duration would otherwise queue hundreds of clips).
export const MAX_LECTURE_SECONDS = 4 * 60 * 60;

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
export const NOTES_MODEL = process.env.OPENAI_NOTES_MODEL || "gpt-5.4-mini";

export function segmentCount(durationSeconds: number) {
  return Math.max(1, Math.ceil(durationSeconds / SEGMENT_SECONDS));
}

export function segmentBounds(idx: number, durationSeconds: number) {
  const start = idx * SEGMENT_SECONDS;
  return { start, end: Math.min(durationSeconds, start + SEGMENT_SECONDS) };
}
