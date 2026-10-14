import type { LessonNoteRow, LessonNoteStatus } from "@/lib/types";

// What the admin lesson table needs about a lesson's notes, without shipping
// every draft/transcript to the page.
export const NOTE_SUMMARY_COLUMNS =
  "lesson_id, status, segments_total, error, generated_at, published_at, has_unpublished_changes";

export type LessonNoteSummaryRow = Pick<
  LessonNoteRow,
  "lesson_id" | "status" | "segments_total" | "error" | "generated_at" | "published_at" | "has_unpublished_changes"
>;

export interface LessonNoteSummary {
  status: LessonNoteStatus;
  segmentsTotal: number;
  segmentsDone: number;
  error: string | null;
  // A draft exists once the compose step has succeeded at least once.
  hasDraft: boolean;
  // published_at is set exactly when published_md is.
  isPublished: boolean;
  hasUnpublishedChanges: boolean;
  generatedAt: string | null;
  publishedAt: string | null;
}

export function summarizeNote(note: LessonNoteSummaryRow, segmentsDone: number): LessonNoteSummary {
  return {
    status: note.status,
    segmentsTotal: note.segments_total,
    segmentsDone,
    error: note.error,
    hasDraft: note.generated_at !== null,
    isPublished: note.published_at !== null,
    hasUnpublishedChanges: note.has_unpublished_changes,
    generatedAt: note.generated_at,
    publishedAt: note.published_at,
  };
}
