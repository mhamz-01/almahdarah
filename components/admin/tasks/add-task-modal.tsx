"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { TaskRow } from "@/lib/types";

const inputClasses =
  "h-11 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectSuggestions: string[];
  onCreated: (task: TaskRow) => void;
}

export function AddTaskModal({ open, onOpenChange, subjectSuggestions, onCreated }: AddTaskModalProps) {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setSubject("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setFile(null);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  const isValid = Boolean(subject.trim() && title.trim());

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("subject", subject.trim());
      form.set("title", title.trim());
      form.set("description", description.trim());
      form.set("due_date", dueDate);
      if (file) form.set("file", file);

      const res = await fetch("/api/admin/tasks", { method: "POST", body: form });
      const json = (await res.json()) as { ok: boolean; task?: TaskRow; error?: string };
      if (!res.ok || !json.ok || !json.task) throw new Error(json.error ?? "Request failed");
      onCreated(json.task);
      reset();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add this task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>Add a task</DialogTitle>
        <DialogDescription>It goes live to every student on the portal immediately.</DialogDescription>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              type="text"
              list="task-subject-suggestions"
              placeholder="Tafsīr"
              className={inputClasses}
            />
            <datalist id="task-subject-suggestions">
              {subjectSuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Task title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="Memorise Surah al-Mulk, verses 1–10"
              className={inputClasses}
            />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Instructions (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What the student should do, and anything they need to bring to class"
              className="resize-y rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] py-[13px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Due date (optional)</span>
            <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className={inputClasses} />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Attachment (optional)</span>
            <input
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              type="file"
              className="rounded-xl border-[1.5px] border-dashed border-border-strong bg-surface px-[15px] py-[13px] text-[13px] text-text file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-primary"
            />
            <span className="text-[11.5px] text-muted">Worksheets, PDFs, or images — up to 15MB.</span>
          </label>

          {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`mt-1 flex h-12 items-center justify-center rounded-full text-[14.5px] font-bold transition-colors duration-200 ${
              isValid && !submitting
                ? "cursor-pointer bg-primary text-white hover:brightness-[1.07]"
                : "cursor-not-allowed bg-surface-2 text-muted"
            }`}
          >
            {submitting ? "Adding…" : "Add task"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
