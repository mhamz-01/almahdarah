"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { LectureNotes } from "@/components/notes/lecture-notes";
import type { CourseLessonRow, LessonNoteRow, LessonTranscriptSegmentRow } from "@/lib/types";

interface LessonNotesReviewDialogProps {
  lesson: CourseLessonRow;
  courseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteChange: (note: LessonNoteRow) => void;
  onRegenerate: () => void;
  regenerateDisabled: boolean;
}

type Tab = "preview" | "edit" | "transcript";

function clock(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const tabClasses = (active: boolean) =>
  `h-9 rounded-full px-4 text-[12.5px] font-bold transition-colors ${
    active ? "bg-ink text-bg" : "text-muted hover:bg-surface-2 hover:text-ink"
  }`;
const secondaryButton =
  "flex h-10 items-center rounded-full border-[1.5px] border-border-strong bg-surface px-4 text-[13px] font-bold text-text transition-colors hover:border-primary disabled:opacity-50";

export function LessonNotesReviewDialog({
  lesson,
  courseTitle,
  open,
  onOpenChange,
  onNoteChange,
  onRegenerate,
  regenerateDisabled,
}: LessonNotesReviewDialogProps) {
  const [note, setNote] = useState<LessonNoteRow | null>(null);
  const [segments, setSegments] = useState<LessonTranscriptSegmentRow[]>([]);
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<Tab>("preview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The panel mounts this dialog fresh (keyed by lesson) each time it opens,
  // so state starts clean and this only has to load.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/lesson-notes/${lesson.id}`)
      .then((res) => res.json())
      .then((json: { ok: boolean; note?: LessonNoteRow | null; segments?: LessonTranscriptSegmentRow[]; error?: string }) => {
        if (cancelled) return;
        if (!json.ok) throw new Error(json.error ?? "Couldn't load notes");
        setNote(json.note ?? null);
        setDraft(json.note?.draft_md ?? "");
        setSegments(json.segments ?? []);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Couldn't load notes"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [lesson.id]);

  const dirty = note !== null && draft.trim() !== (note.draft_md ?? "");
  const isPublished = Boolean(note?.published_md);
  const upToDate = isPublished && !dirty && note?.draft_md === note?.published_md;

  async function save(action?: "publish" | "unpublish") {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lesson-notes/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(dirty ? { draftMd: draft } : {}), ...(action ? { action } : {}) }),
      });
      const json = (await res.json()) as { ok: boolean; note?: LessonNoteRow; error?: string };
      if (!res.ok || !json.ok || !json.note) throw new Error(json.error ?? "Request failed");
      setNote(json.note);
      setDraft(json.note.draft_md ?? "");
      onNoteChange(json.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="flex max-h-[90vh] max-w-[960px] flex-col">
        <div className="pr-10">
          <div className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">
            {courseTitle} · Lesson {lesson.position}
          </div>
          <DialogTitle className="mt-1.5 text-[20px]">{lesson.title}</DialogTitle>
          <DialogDescription className="text-[13px]">
            {note?.published_at
              ? upToDate
                ? `Published ${formatDate(note.published_at)} — students can read this.`
                : `Published ${formatDate(note.published_at)} — your latest changes aren't live yet.`
              : "Not published — students can't see these notes yet."}
          </DialogDescription>
        </div>

        <p className="mt-4 rounded-xl border border-gold/50 bg-gold/10 px-4 py-2.5 text-[12.5px] leading-[1.5] text-[#8a6b12]">
          AI-generated from the lecture audio. Check names, āyah and hadith references, and any rulings against
          the video before publishing.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <button type="button" className={tabClasses(tab === "preview")} onClick={() => setTab("preview")}>
            Preview
          </button>
          <button type="button" className={tabClasses(tab === "edit")} onClick={() => setTab("edit")}>
            Edit{dirty ? " •" : ""}
          </button>
          <button type="button" className={tabClasses(tab === "transcript")} onClick={() => setTab("transcript")}>
            Transcript
          </button>
        </div>

        <div className="mt-3 min-h-[240px] flex-1 overflow-y-auto rounded-xl border border-border bg-bg p-5 thin-scroll">
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : tab === "preview" ? (
            draft.trim() ? <LectureNotes markdown={draft} /> : <p className="text-muted">No notes yet.</p>
          ) : tab === "edit" ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck
              className="h-full min-h-[50vh] w-full resize-none bg-transparent font-mono text-[13px] leading-[1.65] text-ink focus:outline-none"
            />
          ) : segments.length === 0 ? (
            <p className="text-muted">No transcript saved.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-[12.5px] leading-[1.5] text-muted">
                The video is transcribed in {segments.length} part{segments.length === 1 ? "" : "s"}. Open a part on
                YouTube at its start time to check the text against what is said.
              </p>
              {segments.map((s) => {
                const minutes = (s.end_seconds - s.start_seconds) / 60;
                const flag = !s.text.trim()
                  ? "No speech detected in this part"
                  : s.text.length / minutes < 150
                    ? "Unusually short for this length — check it"
                    : null;
                return (
                  <details key={s.idx} open className="rounded-xl border border-border bg-surface p-4">
                    <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
                      <span className="font-bold text-ink">
                        Part {s.idx + 1} · {clock(s.start_seconds)} – {clock(s.end_seconds)}
                      </span>
                      <span>{s.text.length.toLocaleString()} characters</span>
                      {flag && <span className="font-bold text-red-600">{flag}</span>}
                      <a
                        href={`https://www.youtube.com/watch?v=${lesson.youtube_video_id}&t=${s.start_seconds}s`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-primary hover:underline"
                      >
                        Open at {clock(s.start_seconds)} ↗
                      </a>
                    </summary>
                    <p dir="auto" className="mt-3 text-[15px] leading-[1.9] whitespace-pre-wrap text-text">
                      {s.text || "(no speech)"}
                    </p>
                  </details>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-[12.5px] font-semibold text-red-600">{error}</p>}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={saving || regenerateDisabled}
            title="Transcribe the video again and write fresh notes. Published notes stay live until you publish the new draft."
            className={secondaryButton}
          >
            Regenerate
          </button>
          <div className="flex flex-wrap gap-2">
            {isPublished && (
              <button type="button" onClick={() => save("unpublish")} disabled={saving} className={secondaryButton}>
                Unpublish
              </button>
            )}
            {dirty && (
              <button type="button" onClick={() => save()} disabled={saving || !draft.trim()} className={secondaryButton}>
                Save draft
              </button>
            )}
            <button
              type="button"
              onClick={() => save("publish")}
              disabled={saving || loading || !draft.trim() || upToDate}
              className="flex h-10 items-center rounded-full bg-primary px-5 text-[13px] font-bold text-white transition-colors hover:brightness-[1.07] disabled:opacity-50"
            >
              {saving ? "Saving…" : upToDate ? "Published" : isPublished ? "Publish changes" : "Publish to students"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
